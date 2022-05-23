import "module-alias/register";
import("dotenv/config");
import("cache-manager/lib/stores/memory");
import * as express from "express";
import cluster from "cluster";
import os from "os";

import { HasConfig } from "@/config/config";
import { listen } from "./util/http";
import startupMessage from "./util/startupMessage";

export const setupWorkerProcesses = async () => {
  let numCores = os.cpus().length;

  for (let i = 0; i < numCores; i++) {
    cluster.fork({ output: i == 0 });
  }

  cluster.on("exit", function (_worker, _code, _signal) {
    cluster.fork();
  });
};

async function setupApp(output: boolean) {
  const app = express.default();

  // load all the loaders
  (await import("./loaders")).default({ expressApp: app });

  // run server
  listen({ expressApp: app });

  if (output) {
    startupMessage();
  }
}

const setupServer = async () => {
  try {
    if (cluster.isPrimary) {
      const exists = await HasConfig();
      if (exists) {
        setupWorkerProcesses();
      } else {
        setupApp(true);
      }
    } else {
      setupApp(process.env.output === "true");
    }
  } catch (error) {
    console.log(error);
  }
};

setupServer();
