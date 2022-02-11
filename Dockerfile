FROM node:17.5.0-alpine
ENV APP_DIR="/app" VIEWS_FOLDER="/app/views" DATA_FOLDER="/data"
RUN apk add --no-cache ca-certificates shadow bash wget;
RUN mkdir -p /app && chown node:node /app
COPY --chown=node:node --chmod=0755 ./pkg/frontend/build /app/views/frontend
COPY --chown=node:node --chmod=0755 ./pkg/admin/build /app/views/admin
COPY --chown=node:node --chmod=0755 ./pkg/api/dist /app/api
COPY --chown=node:node --chmod=0755 ./pkg/api/node_modules /app/api/node_modules
COPY ./docker /
RUN chmod +x /init.sh
WORKDIR /app
EXPOSE 7777
VOLUME ["/data"]
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD ["wget", "--spider", "http://localhost:7777/health"]
ENTRYPOINT ["/init.sh"]
LABEL org.opencontainers.image.vendor="petio-team"
LABEL org.opencontainers.image.url="https://github.com/petio-team/petio"
LABEL org.opencontainers.image.documentation="https://docs.petio.tv/"
LABEL org.opencontainers.image.licenses="MIT"