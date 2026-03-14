# Stage 1: Install dependencies and build
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy dependency manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/web/package.json apps/web/
COPY apps/server/package.json apps/server/
COPY packages/shared/package.json packages/shared/
COPY tsconfig.base.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# Copy source code
COPY packages/ packages/
COPY apps/ apps/

# Generate Prisma Client
RUN cd apps/server && npx prisma generate

# Build: frontend → backend → copy frontend dist to server/public
RUN pnpm build:web && pnpm build:server
RUN rm -rf apps/server/public && cp -r apps/web/dist apps/server/public

# Stage 2: Production image
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy only what's needed for production
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/server/package.json apps/server/
COPY packages/shared/package.json packages/shared/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile 2>/dev/null || pnpm install --prod

# Copy built artifacts
COPY --from=builder /app/apps/server/dist apps/server/dist/
COPY --from=builder /app/apps/server/public apps/server/public/
COPY --from=builder /app/apps/server/prisma apps/server/prisma/
COPY --from=builder /app/packages/shared/dist packages/shared/dist/
COPY --from=builder /app/node_modules/.pnpm node_modules/.pnpm/
COPY --from=builder /app/apps/server/node_modules apps/server/node_modules/

# Generate Prisma Client in production image
RUN cd apps/server && npx prisma generate

# Create data directory for SQLite
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_URL="file:/app/data/jifylife.db"

EXPOSE 3001

# Run database migrations and start server
CMD cd apps/server && npx prisma db push --accept-data-loss && cd /app && node apps/server/dist/index.js
