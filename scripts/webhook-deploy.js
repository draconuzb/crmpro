const http = require("http");
const crypto = require("crypto");
const { execSync } = require("child_process");
const fs = require("fs");

const PORT = 9000;
const SECRET = process.env.WEBHOOK_SECRET || "modme-deploy-secret-2026";
const APP_DIR = "/home/ubuntu/modme-crm";
const LOG_FILE = APP_DIR + "/deploy.log";

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}\n`;
  console.log(line.trim());
  fs.appendFileSync(LOG_FILE, line);
}

function verifySignature(payload, signature) {
  if (!signature) return false;
  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(payload);
  const digest = "sha256=" + hmac.digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/deploy") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      const signature = req.headers["x-hub-signature-256"];
      if (!verifySignature(body, signature)) {
        log("REJECTED: Invalid signature");
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }
      try {
        const payload = JSON.parse(body);
        if (payload.ref !== "refs/heads/main") {
          log("SKIP: Push to " + payload.ref);
          res.writeHead(200);
          res.end("Skipped");
          return;
        }
        log("DEPLOY START: " + (payload.head_commit?.message || ""));
        res.writeHead(200);
        res.end("Deploying...");

        try {
          execSync(`cd ${APP_DIR} && git pull origin main 2>&1`, { timeout: 30000 });
          log("Git pull: OK");
          execSync(`cd ${APP_DIR} && docker run --rm -v "$(pwd)":/app -w /app node:20-alpine sh -c "corepack enable && corepack prepare pnpm@9.15.4 --activate && pnpm install --frozen-lockfile && pnpm --filter api build" 2>&1`, { timeout: 300000 });
          log("API build: OK");
          execSync(`cd ${APP_DIR} && docker compose -f docker-compose.prod.yml up -d --build 2>&1`, { timeout: 300000 });
          log("Docker rebuild: OK");
          log("DEPLOY COMPLETE!");
        } catch (err) {
          log("DEPLOY ERROR: " + err.message);
        }
      } catch (err) {
        log("Parse error: " + err.message);
        res.writeHead(400);
        res.end("Bad request");
      }
    });
  } else if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200);
    res.end("OK");
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(PORT, () => log("Webhook server listening on port " + PORT));
