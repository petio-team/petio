const path = require("path");

const ROOT_DIR = process.pkg ? path.dirname(process.execPath) : process.cwd();

module.exports = {
    rootDir: ROOT_DIR,
    env: process.env.NODE_ENV ?? "production",
    puid: process.env.PUID ? parseInt(process.env.PUID) : 1000,
    pgid: process.env.PGID ? parseInt(process.env.PGID) : 1000,
    dataFolder: process.env.DATA_FOLDER ?? path.join(ROOT_DIR, "./data"),
    tmdbApiKey: '1af5ad19a2d972a67cd27eb033979c4c',
    fanartApiKey: 'ee409f6fb0c5cd2352e7a454d3f580d4',
};