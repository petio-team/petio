const path = require("path");

const ROOT_DIR = process.pkg ? path.dirname(process.execPath) : process.cwd();

module.exports = {
    rootDir: ROOT_DIR,
    configFolder: process.env.CONFIG_FOLDER ?? path.join(ROOT_DIR, "./config"),
    logsFolder: process.env.LOGS_FOLDER ?? path.join(ROOT_DIR, "./logs"),
};