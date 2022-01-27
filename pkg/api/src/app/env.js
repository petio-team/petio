const path = require("path");

const ROOT_DIR = process.pkg ? path.dirname(process.execPath) : process.cwd();
const APP_DIR = process.pkg ?
    path.join(__dirname, "../../../../../") :
    process.env.APP_DIR ?
        process.env.APP_DIR :
        path.join(__dirname, "../../../../");

const VIEW_FOLDER = process.env.VIEWS_FOLDER ?? path.join(APP_DIR, './pkg');

module.exports = {
    rootDir: ROOT_DIR,
    env: process.env.NODE_ENV ?? "production",
    dataFolder: process.env.DATA_FOLDER ?? path.join(ROOT_DIR, "./data"),
    frontendView: path.join(VIEW_FOLDER, './frontend'),
    adminView: path.join(VIEW_FOLDER, './admin'),
    tmdbApiKey: '1af5ad19a2d972a67cd27eb033979c4c',
    fanartApiKey: 'ee409f6fb0c5cd2352e7a454d3f580d4',
};