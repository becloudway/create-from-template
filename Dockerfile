ARG NODE_VERSION=18

FROM node:${NODE_VERSION}-alpine AS builder
ARG WORKSPACE_NAME
WORKDIR /app
COPY . ./
RUN yarn
RUN yarn workspaces focus --production ${WORKSPACE_NAME}


FROM node:${NODE_VERSION}-alpine
ARG BUNDLE_FOLDER
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY ${BUNDLE_FOLDER} .

CMD ["node", "/app/index.bundle.js"]