FROM node:20.12.2-alpine3.18

WORKDIR /app

# Активируем pnpm
RUN corepack enable

# Копируем манифесты
COPY package.json pnpm-lock.yaml ./

# Устанавливаем зависимости
RUN pnpm install --frozen-lockfile

# Копируем исходники
COPY . .

# RUN pnpx prisma migrate deploy && pnpx prisma generate && pnpm run build

CMD ["sh", "-c", "pnpx prisma migrate deploy && pnpx prisma generate && pnpm dev"]