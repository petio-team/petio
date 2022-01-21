const fs = require('fs');

const {
    dataFolder,
} = require('../app/env');

const doPerms = () => {
    try {
        fs.accessSync(dataFolder, fs.constants.R_OK | fs.constants.W_OK);
    } catch (e) {
        throw new Error("data folder is not readable and writable");
    }
};

module.exports = doPerms;