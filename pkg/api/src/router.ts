import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import fs from "fs";

import apiRoutes from "./routes/api";
import { conf } from "./app/config";
import checkSetup from "./middleware/setup";
import { frontendView, env } from "./app/env";
import { routing } from "@routes/v1/api";
import logger from "./app/logger";
import { attachRouting, createConfig } from "express-zod-api";

// setups the core of the router
export const SetupRouter = (restartFunc) => {
  const router = express();

  // setup the middleware that modify requests and responses
  router.use(
    cors({
      origin: (_, callback) => {
        callback(null, true);
      },
      credentials: true,
    })
  );
  router.use(express.json());
  router.use(express.urlencoded({ extended: true }));
  router.use(cookieParser());
  router.use(checkSetup);
  router.set("trust proxy", conf.get("petio.proxies"));
  router.set("restart", restartFunc);

  const config = createConfig({
    app: router,
    cors: true,
    logger: logger,
    startupLogo: false,
  });
  const { notFoundHandler } = attachRouting(config, routing);
  router.use(notFoundHandler);

  // setup the different routes
  routes(router);

  try {
    // listen on the address and port specified in the settings
    return router.listen(conf.get("petio.port"), conf.get("petio.host"));
  } catch (e) {
    logger.error(e);
    throw new Error(
      "failed to bind server on '" +
        conf.get("petio.host") +
        ":" +
        conf.get("petio.port") +
        "'"
    );
  }
};

// setup the core routes that our frontend, admin and api will use
const routes = (router) => {
  const baseRouter = express.Router();

  baseRouter.get("/health", (_, res) => {
    res.status(200).send(".");
  });
  baseRouter.use("/api", apiRoutes);

  if (env !== "development") {
    let frontendPath = path.resolve(frontendView);
    if (!fs.existsSync(path.join(frontendPath, "index.html"))) {
      const frontendBuildPath = path.join(frontendPath, "./build");
      if (!fs.existsSync(path.join(frontendBuildPath, "./index.html"))) {
        throw new Error("unable to find views files for frontend");
      } else {
        frontendPath = frontendBuildPath;
      }
    }
    baseRouter.use(express.static(frontendPath));
  }

  if (conf.get("petio.subpath") !== "/") {
    router.use(`${conf.get("petio.subpath")}`, baseRouter);
  } else {
    router.use(`/`, baseRouter);
  }
};
