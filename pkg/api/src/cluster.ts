import cluster from "cluster";
import os from "os";
import process from "node:process";

import * as app from "./app/app";
import logger from "./app/logger";
import { conf, loadConfig } from "./app/config";

const workers: number[] = [];

const addWorker = () => {
  workers.push(cluster.fork().id);
};

const removeWorker = (id) => {
  workers.splice(workers.indexOf(id), 1);
};

export const runForks = () => {
  const cores = os.cpus().length;
  // Create a worker for each CPU
  for (let i = 0; i < cores; i++) {
    addWorker();
  }

  cluster.on("exit", (worker, code, signal) => {
    if (workers.indexOf(worker.id) !== -1) {
      logger.debug(
        `worker ${worker.process.pid} exited (signal: ${signal}). Trying to respawn...`
      );
      removeWorker(worker.id);
      addWorker();
    }
  });
};

(async function () {
  try {
    loadConfig();
    logger.transports[0].level = conf.get("logger.level");

    if (cluster.isPrimary) {
      await app.start();
    } else {
      logger.debug(`started worker: ${cluster?.worker?.id}`);
      import("./tasks");
    }
  } catch (e) {
    console.log(e.stack);
    process.exit(1);
  }
})();
