# ARG IMAGE_ARCH=amd64
# FROM ${IMAGE_ARCH}/alpine:3.9



# Use the official image as a parent image.
FROM node:14.15.1-alpine3.12

COPY ./ /app/
WORKDIR /app

LABEL maintainer="Petio"

# Run the command inside your image filesystem.
RUN npm install

VOLUME /config

# Add metadata to the image to describe which port the container is listening on at runtime.
EXPOSE 32600 32601 32650 32700

# Run the specified command within the container.
CMD [ "npm", "start" ]
# CMD ["node app.js"]