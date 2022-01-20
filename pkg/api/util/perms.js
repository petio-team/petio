const fs = require('fs');

const {
    configFolder,
    logsFolder,
    pgid,
    puid,
} = require('../app/env');

const checkPerms = async () => {
    // check we can read and write to the config folder
    fs.access(configFolder, fs.constants.R_OK | fs.constants.W_OK, (err) => {
        if (err) {
            fs.chown(configFolder, puid, pgid, (error) => {
                if (error) {
                    throw new Error("failed to change ownership of config folder");
                }
            });
        }
    });

    // check we can read and write to the logs folder
    fs.access(logsFolder, fs.constants.R_OK | fs.constants.W_OK, (err) => {
        if (err) {
            fs.chown(configFolder, puid, pgid, (error) => {
                if (error) {
                    throw new Error("failed to change ownership of logs folder");
                }
            });
        }
    });
};

module.exports = checkPerms;