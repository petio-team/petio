FROM ghcr.io/adrfranklin/nodedevcontainer:latest
# Install Alpine packages
RUN apk update && apk add -q --update --progress --no-cache curl
# Install Task
RUN sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b /usr/local/bin && chmod +x /usr/local/bin/task
# Install Earthly
RUN wget https://github.com/earthly/earthly/releases/latest/download/earthly-linux-amd64 -O /usr/local/bin/earthly \
    && chmod +x /usr/local/bin/earthly \
    && /usr/local/bin/earthly bootstrap --with-autocomplete
# Make sure better-commits and semantic-release exists
RUN npm install -g better-commits semantic-release \
    && echo "alias bc='better-commits'" >> /root/.zshrc \
    && echo "alias sr='semantic-release'" >> /root/.zshrc
