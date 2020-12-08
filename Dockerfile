FROM node:14.15.1-alpine3.12 as build

LABEL maintainer="Petio"

COPY ./ /app/
VOLUME /config
EXPOSE 7778

WORKDIR /app/frontend
RUN npm ci \
  && npm run build

WORKDIR /app/admin
RUN npm ci \
  && npm run build

FROM nginx:1.15

COPY --from=build /app/frontend/build/ /usr/share/nginx/html
COPY --from=build /app/admin/build/ /usr/share/nginx/html/admin

EXPOSE 80
