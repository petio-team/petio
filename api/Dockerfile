# ARG IMAGE_ARCH=amd64
# FROM ${IMAGE_ARCH}/alpine:3.9



# Use the official image as a parent image.
FROM node:current

COPY ./ /app/api
WORKDIR /app/api

LABEL maintainer="Petio"

# Run the command inside your image filesystem.
RUN npm install

VOLUME /config

# Add metadata to the image to describe which port the container is listening on at runtime.
EXPOSE 32600 32601

# Run the specified command within the container.
CMD [ "npm", "start" ]
# CMD ["node app.js"]