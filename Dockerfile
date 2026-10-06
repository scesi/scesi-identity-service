FROM node:24-alpine

WORKDIR /usr/src/app

RUN corepack enable && corepack prepare pnpm@12.9.1 --activate
ENV CI=true
ENV HUSKY=0

# pnpm-workspace.yaml is required: it holds `overrides` (and allowBuilds) that
# are recorded in pnpm-lock.yaml. Omitting it => ERR_PNPM_LOCKFILE_CONFIG_MISMATCH.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

EXPOSE 8000

CMD ["pnpm", "start"]