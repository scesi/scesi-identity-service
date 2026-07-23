FROM node:24-alpine

WORKDIR /usr/src/app

RUN corepack enable && corepack prepare pnpm@latest --activate
ENV CI=true
ENV HUSKY=0

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

EXPOSE 8000

CMD ["pnpm", "start"]