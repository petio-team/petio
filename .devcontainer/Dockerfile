FROM qmcgaw/nodedevcontainer
# Install Alpine packages
RUN apk add -q --update --progress --no-cache curl
# Install Task
RUN sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b /usr/local/bin && chmod +x /usr/local/bin/task
