import cors from "cors";
import express from "express";
import locals from "../app/locals";
import path from "path";
import routes from "../routes";

/**
 * Router is used to create and setup express and it's routes
 */
const Router = (): express.Express => {
  const server = express();

  // Express configured options
  server.use(express.urlencoded({ extended: true }));
  server.use(express.json());
  server.use(
    cors({
      origin: (_origin, callback) => {
        callback(null, true);
      },
      credentials: true,
    })
  );

  // Trusted Proxies
  if (locals.TRUSTED_PROXIES) {
    server.set("trust proxy", locals.TRUSTED_PROXIES);
  }

  const frontendViews = locals.IS_PROD
    ? path.join(locals.APP_DIR, "./views/frontend")
    : path.join(locals.APP_DIR, "./packages/frontend/build");

  const adminViews = locals.IS_PROD
    ? path.join(locals.APP_DIR, "./views/admin")
    : path.join(locals.APP_DIR, "./packages/admin/build");

  // Setup generic routes
  server.use("/", express.static(frontendViews));
  server.use("/admin", express.static(adminViews));
  server.use("/api/v1", routes);
  server.use("/health", HealthCheckHandler);
  server.use("*", CatchAllHandler);

  return server;
};

/**
 * HealthCheckHandler is a route that can be used to check if the service is alive
 * and running
 *
 * @param req an express request
 * @param res an express result
 */
const HealthCheckHandler = (
  _req: express.Request,
  res: express.Response
): void => {
  res.status(200).json({ uptime: process.uptime() });
};

/**
 * CatchAllHandler req an express request object
 * @param res an express result object
 */
const CatchAllHandler = (req: express.Request, res: express.Response) => {
  res.status(400).json({ error: `Path not found: ${req.path}` });
};

export default Router;
