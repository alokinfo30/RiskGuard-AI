# ==============================================================================
# RiskGuard AI — Multi-Stage Production Dockerfile for Google Cloud Run
# ==============================================================================

# STAGE 1: Build Frontend Assets
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies with frozen lockfile
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code and build client bundle
COPY . .
RUN npm run build

# STAGE 2: Production Minimal Runtime
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy production dependencies and built distribution
COPY package.json ./
RUN npm install --omit=dev && npm install -g tsx

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src ./src

# Create persistent storage directory for audit append log
RUN mkdir -p /app/data && chown -R node:node /app

USER node

EXPOSE 3000

# Cloud Run healthcheck compatible entrypoint
CMD ["tsx", "server.ts"]
