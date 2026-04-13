# Stage 1: Build frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Production server (Express serves API + static frontend)
FROM node:20-alpine AS production
WORKDIR /app

COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy server source, prisma, scripts
COPY --from=builder /app/src/server ./src/server
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

CMD ["sh", "scripts/start-prod.sh"]
