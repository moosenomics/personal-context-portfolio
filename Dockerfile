FROM node:20-slim AS builder

WORKDIR /build/server

# Copy server package files and install
COPY server/package.json server/package-lock.json ./
RUN npm ci

# Copy server source and build
COPY server/tsconfig.json ./
COPY server/src ./src
RUN npm run build

# Production image
FROM node:20-slim

WORKDIR /app

COPY --from=builder /build/server/package.json ./
COPY --from=builder /build/server/node_modules ./node_modules
COPY --from=builder /build/server/dist ./dist

# Copy portfolios from the repo root
COPY portfolios ./portfolios

# Copy server config (api-keys.json, etc.)
COPY server/config ./config

EXPOSE 8080

CMD ["node", "dist/index.js"]
