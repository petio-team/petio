FROM node:current

COPY ./ /app
WORKDIR /app

LABEL maintainer="Petio"

RUN npm ci

VOLUME /config
EXPOSE 7778

CMD [ "npm", "start" ]
