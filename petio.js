const express = require("express");
const path = require("path");
const app = express();
const fs = require("fs");
const logger = require("./api/util/logger");
const numCPUs = require("os").cpus().length;

class Wrapper {
  // Start Main Wrapper
  async getBase() {
    logger.log("verbose", `Getting base path from config`);
    try {
      let config = false;
      if (process.pkg) {
        logger.log("verbose", `App is running from binary`);
        let project_folder = path.dirname(process.execPath);
        let configFile = path.join(project_folder, "./config/config.json");
        config = JSON.parse(fs.readFileSync(configFile));
      } else {
        config = require("./api/config/config.json");
      }
      if (config.base_path) {
        logger.log("verbose", `Config found base path returned from config`);
        return config.base_path;
      } else {
        logger.log("verbose", `Config found base path not set`);
        return "/";
      }
    } catch {
      logger.log("verbose", `Config not found base path not set`);
      return "/";
    }
  }

  async init() {
    logger.log("info", `WRAPPER: Starting Petio wrapper`);
    logger.log("info", `WRAPPER: OS has ${numCPUs} CPU(s)`);
    if (numCPUs < 2)
      logger.warn(
        "WRAPPER: Warning Petio Requires 2 CPU threads! Please allocate more resources!"
      );
    const API = require("./api/app");
    const router = require("./router");
    process.on("uncaughtException", function (err) {
      if (err.code === "EADDRINUSE") {
        logger.error(
          `Fatal Error: Port already in use ${err.port}. Petio may already be running or is in conflict with another service on the same port.`
        );
      } else {
        logger.log({ level: "error", message: err });
      }
      process.exit(1);
    });
    try {
      let basePath = await this.getBase();
      logger.log("info", `ROUTER: Base path found - ${basePath}`);
      app.use((req, res, next) => {
        req.basePath = basePath;
        next();
      });
      app.use(basePath, router);
      app.get("*", function (req, res) {
        logger.log(
          "warn",
          `ROUTER: Not found - ${req.path} | IP: ${
            req.headers["x-forwarded-for"] || req.connection.remoteAddress
          }`
        );
        res.status(404).send(`Petio Router: not found - ${req.path}`);
      });
      app.listen(7777);
    } catch (err) {
      logger.log({ level: "error", message: err });
    }
  }

  // Catch 404s at main router level
}

const wrapper = new Wrapper();
wrapper.init();
