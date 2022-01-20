const cluster = require("cluster");
require("dotenv/config");
require("cache-manager/lib/stores/memory");

const App = require('./app/app');
const Worker = require("./worker");
const logger = require("./app/logger");
const { loadConfig } = require("./app/config");

// load config
try {
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