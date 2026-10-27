FROM node:24-slim

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable \
    && corepack prepare pnpm@10.8.0 --activate \
    && apt-get update \
    && apt-get install -y openssl \
    && pnpm install --frozen-lockfile

COPY . .

RUN DATABASE_URL="postgresql://user:password@localhost:5432/furniture?schema=public" pnpm exec prisma generate

CMD ["pnpm", "dev"]
