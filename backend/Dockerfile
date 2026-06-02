# ---------- deps ----------
  FROM node:22-alpine AS deps
  WORKDIR /app
  
  RUN corepack enable
  
  COPY package.json pnpm-lock.yaml ./
  RUN pnpm install --frozen-lockfile
  
  
  # ---------- build ----------
  FROM node:22-alpine AS build
  WORKDIR /app
  
  RUN corepack enable
  
  COPY --from=deps /app/node_modules ./node_modules
  COPY . .
  
  RUN pnpm build
  RUN pnpm prune --prod
  
  
  # ---------- runtime ----------
  FROM node:22-alpine AS runtime
  WORKDIR /app
  
  ENV NODE_ENV=production
  
  RUN addgroup -S nodejs && adduser -S nestjs -G nodejs
  
  COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
  COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
  COPY --from=build --chown=nestjs:nodejs /app/package.json ./package.json
  
  USER nestjs
  
  EXPOSE 8080
  
  CMD ["node", "dist/main.js"]