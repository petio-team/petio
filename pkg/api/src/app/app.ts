import mongoose from "mongoose";

import logger from "./logger";
import { conf } from "./config";
import { SetupRouter } from "../router";
import pkg from "../../package.json";
import { runForks } from "../cluster";

let server: any = null;

const restartApp = (): void => {
  if (server != null) {
    server.close();
  }
  start();
};

export const start = async (): Promise<void> => {
  logger.info(`Petio v${pkg.version} [${conf.get("logger.level")}]`);

  server = SetupRouter(restartApp);
  logger.info(
    "Listening on http://" +
      conf.get("petio.host") +
      ":" +
      conf.get("petio.port")
  );

  if (conf.get("admin.id") == -1) {
    logger.warn(
      "Initial setup is required, please proceed to the webui to begin the setup"
    );
  } else {
    await mongoose.connect(conf.get("db.url")).catch((err) => {
      logger.error(err);
      process.exit(1);
    });
    runForks();
  }
};

process.on("uncaughtException", function (err) {
  console.log(err);
  console.log(err.stack);
});
