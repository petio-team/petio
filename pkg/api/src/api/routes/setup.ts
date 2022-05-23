import { Request, Response, Router } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import logger from "@/loaders/logger";
import testConnection from "@/plex/connection";
import { config, WriteConfig } from "@/config/index";
import { CreateOrUpdateUser, UserRole } from "@/models/user";

const route = Router();

export default (app: Router) => {
  app.use("/setup", route);

  route.post("/test_server", async (req, res) => {
    let server = req.body.server;
    if (!server) {
      logger.log("warn", "Test Server bad request");
      res.status(400).send("Bad Request");
      return;
    }
    logger.log(
      "verbose",
      `Testing Server ${server.protocol}://${server.host}:${server.port}?X-Plex-Token=${server.token}`
    );
    try {
      let test = await testConnection(
        server.protocol,
        server.host,
        server.port,
        server.token
      );
      let status = test !== 200 ? "failed" : "connected";
      res.status(200).json({
        status: status,
        code: test,
      });
      logger.log(
        "verbose",
        `Test Server success - ${server.protocol}://${server.host}:${server.port}?X-Plex-Token=${server.token}`
      );
    } catch (err) {
      res.status(400).json({
        status: "failed",
        code: 400,
      });
      logger.log(
        "verbose",
        `Test Server failed - ${server.protocol}://${server.host}:${server.port}?X-Plex-Token=${server.token}`
      );
    }
  });

  route.post("/test_mongo", async (req, res) => {
    let mongo = req.body.mongo;
    logger.log("verbose", `testing mongo connection: ${mongo}`);
    if (!mongo) {
      res.status(400).send("Bad Request");
      logger.log("warn", "Mongo test bad request");
      return;
    }
    try {
      // Ensure no db is passed
      if (mongo.split("@").length > 1) {
        if (mongo.split("@")[1].split("/").length > 1) {
          res.status(401).json({
            status: "failed",
            error: "db path included",
            tried: mongo,
            l: mongo.split("@")[1].split("/").length,
          });
          logger.log("warn", "Mongo test db path included");
          return;
        }
      }
      logger.log("verbose", "Attempting mongo connection");

      await mongoose.disconnect();
      await mongoose.connect(mongo + "/petio");

      res.status(200).json({
        status: "connected",
      });
      logger.log("verbose", "Mongo test connection success");
    } catch (err) {
      res.status(401).json({
        status: "failed",
        error: err,
        tried: mongo,
      });
      logger.log("warn", "Mongo test connection failed");
    }
  });

  route.post("/set", async (req: Request, res: Response) => {
    logger.log("verbose", "Attempting to create config file");
    let user = req.body.user;
    let server = req.body.server;
    let dbUrl = req.body.db;
    if (!user || !server || !dbUrl) {
      res.status(500).send("Missing Fields");
      logger.log("warn", "Config creation missing fields");
      return;
    }

    config.set("db.url", dbUrl + "/petio");
    config.set("plex.protocol", server.protocol);
    config.set("plex.host", server.host);
    config.set("plex.port", server.port);
    config.set("plex.token", server.token);
    config.set("plex.client", server.clientId);

    try {
      await CreateOrUpdateUser({
        title: user.display ?? user.username,
        username: user.username,
        password: bcrypt.hashSync(user.password, 10),
        email: user.email,
        thumbnail: user.thumb,
        altId: "1",
        plexId: user.id,
        lastIp: req.ip,
        role: UserRole.Admin,
        owner: true,
        custom: false,
        disabled: false,
        quotaCount: 0,
      });

      WriteConfig();
      logger.info("restarting to apply new configurations");
      await WaitBeforeRestart(res);
    } catch (err) {
      res.status(500).send("Error Creating config");
      logger.log("error", "Config creation error");
      logger.log({ level: "error", message: err });
    }
  });
};

const WaitBeforeRestart = async (res: Response) => {
  setTimeout(async () => {
    res.app.settings["restart"]();
  }, 1000);
};
