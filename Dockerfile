# build environment
FROM --platform=$BUILDPLATFORM node:16.4.2-alpine3.12 as build-stage
RUN mkdir /app && chown -R node:node /app
WORKDIR /app
RUN apk add --no-cache python3 make g++
USER node
COPY --chown=node:node package*.json ./
RUN SKIP_BUILD=true npm ci
COPY --chown=node:node . .

ARG VERSION

RUN npm run build

# dependency environment
FROM node:16.4.2-alpine3.12 as dependency-stage
RUN mkdir /app && chown -R node:node /app
WORKDIR /app
RUN apk add --no-cache python3 make g++
USER node
COPY --chown=node:node package*.json ./
RUN SKIP_BUILD=true npm ci
RUN npm prune --production

# production environment
FROM node:16.4.2-alpine3.12 as production-stage
RUN mkdir /app && chown -R node:node /app
WORKDIR /app
RUN apk add --no-cache tini

USER node
COPY --chown=node:node server.js .
COPY --chown=node:node config config
COPY --chown=node:node --from=dependency-stage /app/node_modules node_modules
COPY --chown=node:node --from=build-stage /app/dist dist

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/app/server.js"]
