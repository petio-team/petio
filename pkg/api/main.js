require("dotenv/config");
require("cache-manager/lib/stores/memory");

const cluster = require("cluster");

const App = require('./app/app');
const Worker = require("./worker");
const logger = require("./app/logger");
const { loadConfig } = require("./app/config");
const checkPerms = require("./util/perms");

try {
  // attempt to check config/logs folders are readable/writable else try to make them readable/writable
  // throws error if fails
  checkPerms();
  // load config
  loadConfig();
} catch (e) {
  logger.log(e);
  process.exit(1);
}

// check if healthcheck flag is set and run healthcheck
const args = process.argv.slice(2).filter((arg) => arg == "--healthcheck");
if (args.length) {
  require("./healthcheck");
} else {
  if (cluster.isPrimary) {
    App();
  } else {
    new Worker().startCrons();
  }
}