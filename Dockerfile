FROM node:16.3.0-alpine3.13 as builder

RUN apk add --no-cache git
COPY ./ /source/

WORKDIR /build
RUN cp /source/petio.js . && \
    cp /source/router.js . && \
    cp /source/package.json . && \
    npm install && \
    cp -R /source/frontend . && \
    cp -R /source/admin . && \
    cp -R /source/api .

WORKDIR /build/frontend
RUN npm install && \
    npm run build

WORKDIR /build/admin
RUN npm install --legacy-peer-deps && \
    npm run build

WORKDIR /build/api
RUN npm install --legacy-peer-deps

WORKDIR /build/views
RUN mv /build/frontend/build /build/views/frontend && \
    rm -rf /build/frontend && \
    mv /build/admin/build /build/views/admin && \
    rm -rf /build/admin && \
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
LABEL org.opencontainers.image.documentation="https://docs.petio.tv/"
LABEL org.opencontainers.image.licenses="MIT"

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "wget", "--spider", "http://localhost:7777/health" ]
