import DatabaseConnect from "./src/app/db";
import { LoadSettings } from "./src/settings/settings";
import Router from "./src/router/router";
import cluster from "cluster";
import locals from "./src/app/locals";
import logger from "./src/util/logger";
import os from "os";
import process from "process";
import worker from "./src/worker";

const App = async () => {
  if (cluster.isMaster) {
    /**
     * Load Config
     */
    try {
      await LoadSettings();
    } catch (err) {
      console.log(err);
    }

    /**
     * Load Database
     */
    try {
      await DatabaseConnect();
    } catch (err) {
      logger.error(err);
      process.exit();
    }

    /**
     * Check hardware to make sure it meets our requirements
     */
    const cpus = os.cpus().length;
    if (cpus < 2) {
      logger.error("Petio requires atleast 2 cpu cores to run");
      process.exit();
    }

    /**
     * Run the express web server
     */
    const server = Router();

    /**
     * Fork the process as a child worker
     */
    cluster.fork();

    /**
     * Start the server listening
     */
    server.listen(locals.PORT, locals.HOST, () => {
      logger.log("info", `Petio is listening on ${locals.HOST}:${locals.PORT}`);
    });
  } else {
    /**
     * Run scheduled tasks
     */
    new worker().RunCrons();
  }
};

App();
