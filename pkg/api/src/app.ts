import("dotenv/config");
import("cache-manager/lib/stores/memory");
import express from "express";
import cluster, { Worker } from "cluster";
import os from "os";

import { hasConfig } from "@/app/config";
import { listen } from "./util/http";
import startupMessage from "./util/startupMessage";

let workers: Worker[] = [];

export const setupWorkerProcesses = async () => {
  let numCores = os.cpus().length;

  for (let i = 0; i < numCores; i++) {
    workers.push(cluster.fork({ output: i == 0 }));
  }

  cluster.on("exit", function (_worker, _code, _signal) {
    cluster.fork();
    workers.push(cluster.fork());
  });
};

async function setupApp(output: boolean) {
  const app = express();

  // load all the loaders
  (await import("./loaders")).default({ expressApp: app });

  // run server
  listen({ expressApp: app });

  if (output) {
    startupMessage();
  }
}

const setupServer = async () => {
  if (cluster.isPrimary) {
    if (hasConfig()) {
      setupWorkerProcesses();
    } else {
      setupApp(true);
    }
  } else {
    setupApp(process.env.output === "true");
  }
};

setupServer();
