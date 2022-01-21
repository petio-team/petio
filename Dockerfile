FROM alpine:3.15.0
RUN apk add ca-certificates bash;addgroup -g 1000 petio && adduser -u 1000 -D petio -G petio;
COPY --chown=petio:petio --chmod=0755 ./releases/petio-alpine-x64 /
COPY ./docker /
RUN chmod +x /init.sh
EXPOSE 7777
VOLUME ["/data"]
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD ["/petio-alpine-x64", "--host", "0.0.0.0", "--port", "7777", "--healthcheck"]
ENTRYPOINT ["/init.sh"]
LABEL org.opencontainers.image.vendor="petio-team"
LABEL org.opencontainers.image.url="https://github.com/petio-team/petio"
LABEL org.opencontainers.image.documentation="https://docs.petio.tv/"
LABEL org.opencontainers.image.licenses="MIT"