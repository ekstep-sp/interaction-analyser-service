FROM node:alpine

RUN mkdir -p /usr/src/interaction-analyser && chown -R node:node /usr/src/interaction-analyser

WORKDIR /usr/src/interaction-analyser

COPY package.json yarn.lock ./

USER node

RUN yarn install --pure-lockfile

COPY --chown=node:node . .

EXPOSE 3000
