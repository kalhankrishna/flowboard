# syntax=docker/dockerfile:1

# ============================================
# Build Stage
# ============================================
FROM node:24-alpine AS builder

RUN apk add --no-cache python3 make g++ openssl
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY Backend/package.json ./Backend/
COPY Backend/prisma ./Backend/prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter=@flowboard/backend

# Copy Backend source
COPY Backend ./Backend/

#BUILD
RUN pnpm --filter=@flowboard/backend run build

# ============================================
# Production Stage
# ============================================
FROM node:24-alpine AS production
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate
WORKDIR /app

# Copy workspace structure
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY Backend/package.json ./Backend/
COPY Backend/prisma ./Backend/prisma/

# Deploy Backend workspace to /app/deployed with prod deps only
RUN pnpm --filter=@flowboard/backend --prod deploy deployed

# Copy the generated Prisma Client from builder
COPY --from=builder /app/node_modules/.pnpm/@prisma+client*/node_modules/.prisma ./deployed/node_modules/.prisma

# Switch to deployed directory
WORKDIR /app/deployed

# Copy built artifacts from builder
COPY --from=builder /app/Backend/dist ./dist

# Security: non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app/deployed
USER nodejs

EXPOSE 5000
CMD ["node", "dist/index.js"]