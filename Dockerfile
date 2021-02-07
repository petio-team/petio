FROM node:14.15.1-alpine3.12 as build

LABEL maintainer="Petio"

RUN apk add --no-cache git

COPY ./petio.js /app/petio.js
COPY ./package.json /app/package.json
WORKDIR /app
RUN npm install

COPY ./frontend/ /app/frontend/
COPY ./admin/ /app/admin/
COPY ./api/ /app/api/
WORKDIR /app/frontend
RUN npm ci \
  && npm run build
WORKDIR /app/admin
RUN npm ci \
  && npm run build
WORKDIR /app/api
RUN npm install
WORKDIR /app
RUN mkdir views && mv frontend/build views/frontend && mv admin/build views/admin && rm -rf frontend && rm -rf admin


CMD [ "node", "petio.js" ]


VOLUME /app/api/config
EXPOSE 7777
