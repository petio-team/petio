import mongoose from "mongoose";

import logger from "./logger";
import { conf, loadConfig } from "./config";
import { SetupRouter } from "../router";
import pkg from "../../package.json";

let server: any = null;

const app = async () => {
  // load config
  loadConfig();
  // set log level again to config level
  logger.transports[0].level = conf.get("logger.level");
  // setup the core of the router
  server = SetupRouter(restartApp);

  logger.info(`Petio v${pkg.version} [${conf.get("logger.level")}]`);
  logger.info(
    "Listening on http://" +
      conf.get("petio.host") +
      ":" +
      conf.get("petio.port")
  );

  if (conf.get("admin.id") != -1) {
    // connect to db
    await mongoose.connect(conf.get("db.url"));
    // run tasks
    import("../tasks");
  } else {
    logger.warn(
      "Initial setup is required, please proceed to the webui to begin the setup"
    );
  }
};
export default app;

const restartApp = () => {
  if (server != null) {
    server.close();
  }
  app();
};

(async function () {
  try {
    await app();
  } catch (e) {
    console.log(e.stack);
    process.exit(0);
  }
})();
