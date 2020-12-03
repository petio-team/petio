FROM node:current

COPY ./ /app
WORKDIR /app

LABEL maintainer="Petio"

RUN npm ci

VOLUME /config
EXPOSE 32600 32601

CMD [ "npm", "start" ]
