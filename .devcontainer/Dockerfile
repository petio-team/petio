FROM qmcgaw/basedevcontainer:v0.17.0-alpine
# Install Alpine packages
RUN apk add -q --update --progress --no-cache nodejs npm yarn curl
# Setup shells
RUN echo "plugins=(vscode git colorize npm npx yarn docker docker-compose)" >> /root/.zshrc-specific
# Sets directories for NPM global packages
ENV NODE_PATH="/root/.npm-packages/lib/node_modules" \
    MANPATH="/root/.npm-packages/share/man"
RUN echo "prefix = /root/.npm-packages" >> /root/.npmrc
ENV PATH=/root/.npm-packages/bin:$PATH
# Install some global NPM packages
RUN yarn global add -g nodemon jest
# Install Task
RUN sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b /usr/local/bin && chmod +x /usr/local/bin/task