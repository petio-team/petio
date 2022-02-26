import mongoose from "mongoose";
import os from "os";
import cluster from "cluster";

import logger from "./logger";
import { conf } from "./config";
import { SetupRouter } from "../router";
import trending from "../tmdb/trending";
import pkg from "../../package.json";

let server: any = null;

const app = () => {
  logger.info(`Petio v${pkg.version} [${conf.get("logger.level")}]`);
  try {
    // check the num of cpu cores
    if (os.cpus().length < 2) {
      logger.warn(
        "You have less then the recommended logical cores (2 cores) available, performance will be affected"
      );
    }

    // setup the core of the router
    server = SetupRouter(restart);

    if (conf.get("admin.id") != -1) {
      // load db
      connect();
      // pull tending data
      trending();
    }

    // fork process for worker to run on
    cluster.fork();
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
