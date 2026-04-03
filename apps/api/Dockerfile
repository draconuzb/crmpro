# Single stage — pre-built dist is copied in
FROM node:20-alpine

RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
RUN npm install -g prisma@5.22.0

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/

# Install production deps
RUN pnpm install --frozen-lockfile --prod

# Copy pre-built dist, prisma schema, shared
COPY apps/api/dist apps/api/dist
COPY apps/api/prisma apps/api/prisma
COPY packages/shared packages/shared

# Generate Prisma client
RUN cd apps/api && prisma generate

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["sh", "-c", "cd apps/api && prisma migrate deploy && node dist/src/main.js"]
