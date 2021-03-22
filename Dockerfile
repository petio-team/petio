FROM --platform=linux/amd64 node:14.16.0-alpine3.12 as builder

RUN apk add --no-cache git
COPY ./ /source/
RUN mkdir /build && \
    cp /source/petio.js /build/ && \
    cp /source/router.js /build/ && \
    cp /source/package.json /build/ && \
    cd /build && \
    npm install && \
    cp -R /source/frontend /build/ && \
    cp -R /source/admin /build/ && \
    cp -R /source/api /build/ && \
    cd /build/frontend && \
    npm ci && npm run build && \
    cd /build/admin && \
    npm ci && npm run build && \
    cd /build/api && \
    npm install && \
    cd /build && \
    mkdir /build/views && \
    mv /build/frontend/build /build/views/frontend && rm -rf /build/frontend && \
    mv /build/admin/build /build/views/admin && rm -rf /build/admin && \
    chmod -R u=rwX,go=rX /build


FROM alpine:3.13

EXPOSE 7777
VOLUME ["/app/api/config", "/app/logs"]
WORKDIR /app
ENTRYPOINT ["/sbin/tini", "--"]
CMD [ "node", "petio.js" ]

RUN apk add --no-cache nodejs tzdata tini

COPY --from=builder /build/ /app/

LABEL org.opencontainers.image.vendor="petio-team"
LABEL org.opencontainers.image.url="https://github.com/petio-team/petio"
LABEL org.opencontainers.image.documentation="https://github.com/petio-team/petio-docs/wiki"
LABEL org.opencontainers.image.licenses="MIT"
