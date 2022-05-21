import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import routes from "@/api";
import logger from "@/loaders/logger";

interface ExpressError extends Error {
  status: number;
}

export default ({ app }: { app: express.Application }) => {
  // Health Check endpoint
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).end();
  });

  // Enable trusted proxies for people behind reverse proxies
  app.enable("trust proxy");

  // Enable Cross Origin Resource Sharing to all origins by default
  app.use(cors());

  // Transforms the request body string into a json formated object
  app.use(express.json());

  // Enable compression to improve client
  app.use(compression());

  // Enable url encoding
  app.use(express.urlencoded({ extended: true }));

  // Enable cookie parser for parsing cookies
  app.use(cookieParser());

  // configure morgan for http logging
  app.use(
    morgan((tokens: any, req: any, res: any) => {
      const msg = [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, "content-length"),
        "-",
        tokens["response-time"](req, res),
        "ms",
      ].join(" ");
      logger.http(msg);
      return null;
    }, {})
  );

  // Load routes
  app.use("/", routes());

  // catch 404 errors and forward them on the error handler
  app.use((_req: Request, _res: Response, next: NextFunction) => {
    const err = new Error("Not Found");
    err["status"] = 404;
    next(err);
  });

  // error handlers
  app.use(
    (err: ExpressError, _req: Request, res: Response, next: NextFunction) => {
      // handle 401 error thrown by express-jwt
      if (err.name === "UnauthorizedError") {
        return res.status(err.status).send({ message: err.message }).end();
      }
      return next(res);
    }
  );

  app.use(
    (err: ExpressError, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.status || 500);
      res.json({
        errors: {
          message: err.message,
        },
      });
    }
  );
};
