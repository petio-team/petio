FROM node:14.15.1-alpine3.12

COPY ./ /app/api
WORKDIR /app/api

LABEL maintainer="Petio"

RUN npm ci

VOLUME /config
EXPOSE 32600 32601

CMD [ "npm", "start" ]
