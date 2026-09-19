# Multi-stage Dockerfile for @bamboo/api
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

# Copy dependency configs
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
COPY content/ ./content/

# Install dependencies and build packages
RUN pnpm install --frozen-lockfile
RUN pnpm -r run build

# Production runner image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8088
ENV HOST=0.0.0.0

RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

COPY --from=builder /app /app

EXPOSE 8088
CMD ["node", "apps/api/dist/server.mjs"]
