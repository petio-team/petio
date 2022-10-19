FROM node:19-alpine3.16 as builder

# Work Directory
WORKDIR /build

# Add files
COPY . .

# Run yarn to fetch dependencies
RUN yarn workspaces focus --all && \
    yarn workspace frontend run build && \
    yarn workspace admin run build && \
    yarn workspace api run build:prod && \
    chmod -R u=rwX,go=rX /build/pkg

FROM alpine:3.16.2

# Set enviornment variables for the app
ENV APP_DIR="/app"
ENV VIEWS_FOLDER="/app/views"
ENV DATA_FOLDER="/data"

# Install needed dependencies to get the image setup and then remove the cache
RUN apk add --no-cache \
    shadow=4.10-r3 \
    wget=1.21.3-r0 \
    bash=5.1.16-r2 \
    nodejs=16.16.0-r0 && \
    # Remove package cache
    rm -rf /var/cache/apk/* && \
    rm -rf /tmp/*

# Create petio user, group and create folders with permissions
RUN groupadd -g 1000 petio && \
    useradd -r -u 1000 -g petio petio && \
    # Make sure the app directory exists and has the correct permissions
    mkdir -p /app && chown petio:petio /app

# Copy all the build files from both frontend and backend
COPY --from=builder --chown=petio:petio --chmod=0755 /build/pkg/frontend/build /app/views/frontend
COPY --from=builder --chown=petio:petio --chmod=0755 /build/pkg/admin/build /app/views/admin
COPY --from=builder --chown=petio:petio --chmod=0755 /build/pkg/api/dist/index.js /app/index.js
COPY ./scripts/docker /

# Give our init script permission to be executed
RUN chmod +x /init.sh

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
