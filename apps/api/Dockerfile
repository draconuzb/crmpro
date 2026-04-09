# Build stage
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/

RUN pnpm install --no-frozen-lockfile

COPY apps/api/ apps/api/
COPY packages/shared/ packages/shared/

ENV NODE_OPTIONS="--max-old-space-size=512"
RUN cd apps/api && pnpm run build

# Production stage
FROM node:20-alpine

RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/

RUN pnpm install --no-frozen-lockfile --prod

COPY --from=builder /app/apps/api/dist apps/api/dist
COPY apps/api/prisma apps/api/prisma
COPY packages/shared packages/shared

RUN cd apps/api && npx prisma@5.22.0 generate

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["sh", "-c", "cd apps/api && npx prisma@5.22.0 migrate deploy && node dist/main.js"]
