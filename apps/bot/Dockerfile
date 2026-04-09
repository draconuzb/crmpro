FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./

# Copy package.json files for dependency resolution
COPY apps/bot/package.json apps/bot/
COPY packages/shared/package.json packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter @crmpro/bot --filter @crmpro/shared

# Copy source code
COPY packages/shared/ packages/shared/
COPY apps/bot/ apps/bot/

# Build
WORKDIR /app/apps/bot
RUN pnpm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

COPY --from=base /app/apps/bot/dist ./dist
COPY --from=base /app/apps/bot/package.json ./
COPY --from=base /app/node_modules ./node_modules

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
