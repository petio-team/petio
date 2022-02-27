require("module-alias/register");
import("dotenv/config");
import("cache-manager/lib/stores/memory");

import App from "./src/app/app";
import { conf, loadConfig } from "./src/app/config";
import logger from "./src/app/logger";

// TODO: start making async calls at the main entrypoint
(async () => {
  try {
    // load config
    loadConfig();
    // set log level again to config level
    logger.transports[0].level = conf.get("logger.level");
    // call the main application
    await App();
  } catch (e) {
    console.log(e.stack);
    process.exit(1);
  }
})();
