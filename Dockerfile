FROM node:20-alpine3.19 as builder

# Work Directory
WORKDIR /build

# Add files
COPY . .

# Run yarn to fetch dependencies
RUN set -eux; \
    yarn workspaces focus --all && \
    yarn workspace frontend run build && \
    yarn workspace api run build:prod; \
    apkArch="$(apk --print-arch)"; \
    case "$apkArch" in \
    armhf) export GOARM='6' ;; \
    x86) export GO386='387' ;; \
    esac; \

    npx pkg . --no-bytecode --public-packages \"*\" --public --targets node18-alpine-x64 --output /build/dist/releases

FROM scratch

# Set enviornment variables for the app
ENV APP_DIR="/app"
ENV VIEWS_FOLDER="/app/views"
ENV DATA_FOLDER="/data"

# Copy all the build files from both frontend and backend
COPY --from=builder --chown=petio:petio --chmod=0755 /build/dist/

# Makes sure we are in the app folder from now on
WORKDIR /app

# Exposes port 7777 as the default port
EXPOSE 7777

# Add the data path as a volume so configs and logs are shared
VOLUME ["/data"]

# Make sure we run a healthcheck to verify to the user that the container is healthy
# This should be replaced in the future with a healthcheck script with better functionality
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD ["wget", "--spider", "http://localhost:7777/api/health"]

# Declare the entrypoint as our script
ENTRYPOINT ["/init.sh"]

# These labels give more information about the image itself
LABEL org.opencontainers.image.vendor="petio-team"
LABEL org.opencontainers.image.url="https://github.com/petio-team/petio"
LABEL org.opencontainers.image.documentation="https://docs.petio.tv/"
LABEL org.opencontainers.image.licenses="MIT"
