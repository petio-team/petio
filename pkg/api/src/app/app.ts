import mongoose from "mongoose";

import logger from "./logger";
import { conf } from "./config";
import { SetupRouter } from "../router";
import pkg from "../../package.json";

let server: any = null;

const app = async () => {
  logger.info(`Petio v${pkg.version} [${conf.get("logger.level")}]`);
  try {
    // setup the core of the router
    server = SetupRouter(restart);

    if (conf.get("admin.id") != -1) {
      // connect to db
      await connect();
      // run tasks
      import("../tasks");
    }
  } catch (e) {
    console.log(e.stack);
    process.exit(0);
  }

  logger.info(
    "Listening on " + conf.get("petio.host") + ":" + conf.get("petio.port")
  );

  // check if admin id is set else we tell the user they need to go through setup
  if (conf.get("admin.id") == -1) {
    logger.warn(
      "Initial setup is required, please proceed to the webui to begin the setup"
    );
  }
};
export default app;

const restart = () => {
  if (server != null) {
    server.close();
  }
  app();
};

const connect = async () => {
  try {
    mongoose.connect(conf.get("db.url"));
  } catch (err) {
    logger.error("Error connecting to database");
    logger.error(err);
  }
};
