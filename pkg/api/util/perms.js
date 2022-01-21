const fs = require('fs');

const {
    dataFolder,
    pgid,
    puid,
} = require('../app/env');
const logger = require("../app/logger");

const doPerms = () => {
    if (isNaN(puid) || isNaN(pgid)) {
        throw new Error("puid or puid is not a valid number");
    }

    // attempt to set the correct ownership of the files
    try {
        fs.chownSync(dataFolder, puid, pgid);
    } catch (e) {
        logger.error(e);
        throw new Error("failed to set ownership/permissions of config and log folder");
    }
};

module.exports = doPerms;