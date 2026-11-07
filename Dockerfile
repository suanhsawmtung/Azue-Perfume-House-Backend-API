# syntax=docker/dockerfile:1.7

FROM node:24-slim AS base

WORKDIR /app

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable \
    && corepack prepare pnpm@10.8.0 --activate \
    && apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

FROM base AS dependencies

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

FROM dependencies AS build

COPY prisma ./prisma
COPY prisma.config.ts tsconfig.json ./
COPY src ./src
COPY scripts ./scripts

# Prisma 7 loads DATABASE_URL from prisma.config.ts even though client
# generation does not connect to the database. Prefer a BuildKit secret when
# one is available; otherwise use a non-credential placeholder only for this
# build-time generation step.
RUN --mount=type=secret,id=database_url,required=false \
    sh -eu -c 'build_database_url="$(cat /run/secrets/database_url 2>/dev/null || printf "%s" "postgresql://localhost:5432/placeholder")"; export DATABASE_URL="$build_database_url"; pnpm exec prisma generate'

RUN pnpm build

FROM base AS production

ENV NODE_ENV=production

# Keep the Prisma CLI available for a later `prisma migrate deploy` operation
# while excluding source files from the image.
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# The API writes uploaded images below /app/uploads at runtime. Create the
# directories in the image and give the existing non-root Node user ownership.
RUN mkdir -p /app/uploads/images/post \
    /app/uploads/images/product \
    /app/uploads/images/order \
    /app/uploads/images/user \
    && chown -R node:node /app/uploads

USER node

EXPOSE 8080

CMD ["pnpm", "start"]
