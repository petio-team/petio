#!/bin/bash
if [[ ! "${PUID}" -eq 0 ]] && [[ ! "${PGID}" -eq 0 ]]; then
    usermod -o -u "${PUID}" petio
    groupmod -o -g "${PGID}" petio
    usermod -d "/data" petio
fi

chmod "=rwx" "/data"
chown petio:petio "/data"

su petio -c "/petio-alpine-x64 --host 0.0.0.0 --port 7777"