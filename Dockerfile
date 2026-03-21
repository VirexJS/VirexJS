FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lockb* ./
COPY packages/router/package.json packages/router/
COPY packages/bundler/package.json packages/bundler/
COPY packages/db/package.json packages/db/
COPY packages/virexjs/package.json packages/virexjs/
COPY playground/package.json playground/
RUN bun install --frozen-lockfile || bun install

# Build
FROM base AS builder
COPY --from=deps /app/node_modules node_modules
COPY . .
RUN cd playground && bun run ../packages/virexjs/src/cli/index.ts build

# Production
FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app .

EXPOSE 3000
CMD ["bun", "run", "playground/../packages/virexjs/src/cli/index.ts", "preview"]
