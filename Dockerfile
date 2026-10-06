FROM node:24.21.0-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable


FROM base AS build

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY prisma ./prisma
COPY prisma.config.ts ./

RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" pnpm exec prisma generate

COPY tsconfig.json ./
COPY eslint.config.ts ./
COPY src ./src

RUN pnpm build


FROM base AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install \
    --frozen-lockfile \
    --prod

COPY --from=build /app/dist ./dist
COPY --from=build /app/src/generated ./src/generated

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/v1/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "dist/index.js"]