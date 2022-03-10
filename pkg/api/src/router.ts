import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import fs from "fs";
import helmet from "helmet";

import apiRoutes from "./routes/api";
import { conf } from "./app/config";
import checkSetup from "./middleware/setup";
import { frontendView, env } from "./app/env";
import logger from "./app/logger";
import { attachRouting, createConfig } from "express-zod-api";
import { routing } from "./routes/v1/api";

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
  router.use(
    helmet.contentSecurityPolicy({
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "default-src": ["'self'"],
        "connect-src": ["'self'", "plex.tv"],
        "img-src": ["*"],
        "script-src-attr": null,
        "script-src": ["'self'", "www.youtube.com", "'unsafe-inline'"],
      },
    })
  );
  router.use(helmet.dnsPrefetchControl());
  router.use(helmet.expectCt());
  router.use(helmet.frameguard());
  router.use(helmet.hidePoweredBy());
  router.use(helmet.hsts());
  router.use(helmet.ieNoOpen());
  router.use(helmet.noSniff());
  router.use(helmet.originAgentCluster());
  router.use(helmet.permittedCrossDomainPolicies());
  router.use(helmet.referrerPolicy());
  router.use(helmet.xssFilter());

  // set specific options
  router.set("trust proxy", conf.get("petio.proxies"));
  router.set("restart", restartFunc);

  // setup the different routes
  routes(router);

  const config = createConfig({
    app: router,
    cors: true,
    logger: logger,
    startupLogo: false,
  });
  const { notFoundHandler } = attachRouting(config, routing);
  router.use(notFoundHandler);

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
