import { Application } from "express";

import { config } from "@/config/schema";
import logger from "@/loaders/logger";
import { setupWorkerProcesses } from "@/app";

export const listen = ({ expressApp }: { expressApp: Application }) => {
  // run server
  let http = expressApp.listen(
    config.get("petio.port"),
    config.get("petio.host")
  );
  expressApp.set("restart", async () => {
    if (http != null) {
      http.close();
    }
    setupWorkerProcesses();
  });

  // handle express errors
  expressApp.on("error", (error: any) => {
    if (error.syscall !== "listen") {
      throw error;
    }
    switch (error.code) {
      case "EACCES": {
        logger.error("port requires elevated privileges");
        process.exit(1);
      }
      case "EADDRINUSE": {
        logger.error("port is already in use");
        process.exit(1);
      }
      default: {
        throw error;
      }
    }
  });
};
