FROM node:14.15.1-alpine3.12 as builder

RUN apk add --no-cache git
COPY ./petio.js /app/petio.js
COPY ./router.js /app/router.js
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

FROM node:14.15.1-alpine3.12
CMD [ "node", "petio.js" ]
VOLUME /app/api/config
EXPOSE 7777
COPY --from=builder /app /app
WORKDIR /app
LABEL org.opencontainers.image.vendor=Petio
