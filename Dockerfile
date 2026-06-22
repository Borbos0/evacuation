# 1. Сборка
FROM node:20-alpine AS builder
WORKDIR /app

# python3/make/g++ нужны для компиляции нативных модулей (better-sqlite3, bcrypt)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .
# Генерируем Prisma-клиент (src/generated/prisma исключён из .gitignore)
RUN npx prisma generate
RUN npm run build

# 2. Зависимости для девстенда
FROM node:20-alpine AS prod-deps
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

# 3. Раннер
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules      ./node_modules
COPY --from=builder   /app/.next             ./.next
COPY --from=builder   /app/public            ./public
COPY --from=builder   /app/src/generated     ./src/generated

COPY package*.json     ./
COPY next.config.ts    ./
COPY tsconfig.json     ./
COPY prisma            ./prisma
COPY prisma.config.ts  ./

RUN mkdir -p /app/data

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
