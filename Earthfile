VERSION 0.8

build-all:
    BUILD \
        --platform=linux/amd64 \
        --platform=linux/arm64 \
        +build-image

build:
    FROM node:20.11.1-alpine3.19
    WORKDIR /build
    COPY . .
    RUN \
        yarn workspaces focus --all && \
        yarn workspace frontend run build && \
        yarn workspace api run build:prod && \
        yarn run pkg && \
        # rename x64 to amd64
        for f in ./dist/releases/*; do mv "$f" "$(echo "$f" | sed s/x64/amd64/)"; done
    SAVE ARTIFACT ./dist/releases

build-image:
    ARG TARGETPLATFORM
    ARG TARGETARCH
    ARG LABEL=unknown
    ARG --required COMMIT_SHA
    FROM --platform=$TARGETPLATFORM scratch
    ENV DATA_DIR=/data
    ENV HTTP_ADDR=0.0.0.0
    ENV HTTP_PORT=7777
    ENV NODE_ENV=docker
    COPY \
        --platform=linux/amd64 \
        (+build/releases/petio-linuxstatic-$TARGETARCH) ./petio
    VOLUME ["/data"]
    ENTRYPOINT ["/petio"]
    SAVE IMAGE --push ghcr.io/petio-team/petio:$LABEL
    SAVE IMAGE --push ghcr.io/petio-team/petio:$COMMIT_SHA

release:
    FROM node:20.11.1-alpine3.19
    RUN npx semantic-release -d -b dev
