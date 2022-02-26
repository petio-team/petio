import("dotenv/config");
import("cache-manager/lib/stores/memory");

import * as cluster from "cluster";

import App from "./src/app/app";
import Worker from "./src/worker";
import { conf, loadConfig } from "./src/app/config";
import doPerms from "./src/util/perms";
import logger from "./src/app/logger";

try {
  // attempt to check config/logs folders are readable/writable else try to make them readable/writable
  // throws error if fails
  doPerms();
  // load config
  loadConfig();
  // set log level again to config level
  logger.transports[0].level = conf.get("logger.level");

  if (cluster.default.isPrimary) {
    App();
  } else {
    new Worker().startCrons();
  }
} catch (e) {
  console.log(e.stack);
  process.exit(1);
}