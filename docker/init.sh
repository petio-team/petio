#!/bin/bash
if [[ ! "${PUID}" -eq 0 ]] && [[ ! "${PGID}" -eq 0 ]]; then
    usermod -o -u "${PUID}" node
    groupmod -o -g "${PGID}" node
    usermod -d "/data" node
fi

chmod "=rwx" "/data"
chown node:node "/data"

su node -c "/usr/local/bin/node ./api/main.js --host 0.0.0.0 --port 7777"