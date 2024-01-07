FROM node:20

COPY ./ /usr/src/app

WORKDIR /usr/src/app

RUN npm install -g pnpm
RUN pnpm i
RUN pnpm turbo build --filter server

WORKDIR /usr/src/app/apps/server

CMD ["pnpm", "start"]