require("dotenv/config");
require("cache-manager/lib/stores/memory");

const cluster = require("cluster");

const App = require('./src/app/app');
const Worker = require("./src/worker");
const { loadConfig } = require("./src/app/config");
const doPerms = require("./src/util/perms");

try {
  // attempt to check config/logs folders are readable/writable else try to make them readable/writable
  // throws error if fails
  doPerms();
  // load config
  loadConfig();
  // check if healthcheck flag is set and run healthcheck!
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
} catch (e) {
  console.log(e.stack);
  process.exit(1);
}