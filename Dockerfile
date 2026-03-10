FROM node:20-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV DATABASE_URL=file:/app/data/dev.db
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY package.json package-lock.json ./
COPY --from=builder /app/prisma ./prisma

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["sh", "-c", "mkdir -p /app/data && npx prisma db execute --file prisma/migrations/202603101040_init/migration.sql --schema prisma/schema.prisma && node server.js"]
