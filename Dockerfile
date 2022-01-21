FROM alpine:3.15.0
RUN apk add ca-certificates; addgroup -S petio && adduser -S petio -G petio; mkdir /data; touch /data/init;
FROM scratch
COPY --from=0 /etc/passwd /etc/passwd
COPY --from=0 /etc/group /etc/group
COPY --from=0 /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=0 --chown=petio:petio --chmod=0755 /data /data
COPY --chown=petio:petio --chmod=0755 ./releases/petio-linuxstatic-x64 /
USER petio
VOLUME ["/data"]
EXPOSE 7777
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD ["/petio-linuxstatic-x64", "--host", "0.0.0.0", "--port", "7777", "--healthcheck"]
ENTRYPOINT ["/petio-linuxstatic-x64", "--host", "0.0.0.0", "--port", "7777"]
LABEL org.opencontainers.image.vendor="petio-team"
LABEL org.opencontainers.image.url="https://github.com/petio-team/petio"
LABEL org.opencontainers.image.documentation="https://docs.petio.tv/"
LABEL org.opencontainers.image.licenses="MIT"