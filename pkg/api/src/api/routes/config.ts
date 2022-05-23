import { Router } from "express";

import logger from "@/loaders/logger";
import { adminRequired } from "../middleware/auth";
import { HasConfig, WriteConfig } from "@/config/config";
import { config } from "@/config/schema";
import setupReady from "@/util/setupReady";

const route = Router();

export default (app: Router) => {
  app.use("/config", route);

  route.get("/", async (_req, res) => {
    const configStatus = await HasConfig();
    let ready = false;
    if (configStatus !== false) {
      try {
        let setupCheck = await setupReady();
        if (setupCheck.ready) {
          ready = true;
        }
        if (setupCheck.error) {
          res.status(500).json({
            error: "An error has occured",
          });
          return;
        }
      } catch {
        res.status(500).json({
          error: "An error has occured",
        });
        return;
      }
    }
    res.json({
      config: configStatus,
      login_type: config.get("auth.type"),
      ready: ready,
    });
  });

  route.post("/update", adminRequired, async (req, res) => {
    let body = req.body;

    if (body.plexToken != undefined) {
      config.set("plex.token", body.plexToken);
    }
    if (body.base_path != undefined) {
      config.set("petio.subpath", body.base_path);
    }
    if (body.login_type != undefined) {
      config.set("auth.type", body.login_type);
    }
    if (body.plexPopular != undefined) {
      config.set("general.popular", body.plexPopular);
    }
    if (body.telegram_bot_token != undefined) {
      config.set("notifications.telegram.token", body.telegram_bot_token);
    }
    if (body.telegram_chat_id != undefined) {
      config.set("notifications.telegram.id", body.telegram_chat_id);
    }
    if (body.telegram_send_silently != undefined) {
      config.set("notifications.telegram.silent", body.telegram_send_silently);
    }
    if (body.discord_webhook != undefined) {
      config.set("notifications.discord.url", body.discord_webhook);
    }

    try {
      await WriteConfig();
    } catch (err) {
      logger.error(err);
      res.status(500).send("Config Not Found");
    }

    res.status(200).send("config updated");
  });

  route.get("/current", adminRequired, async (_req, res) => {
    try {
      const json = {
        base_path: config.get("petio.subpath"),
        login_type: config.get("auth.type"),
        plexPopular: config.get("general.popular"),
        discord_webhook: config.get("notifications.discord.url"),
        telegram_bot_token: config.get("notifications.telegram.token"),
        telegram_chat_id: config.get("notifications.telegram.id"),
        telegram_send_silently: config.get("notifications.telegram.silent"),
      };
      res.json(json);
    } catch (err) {
      logger.log("error", "ROUTE: Config error");
      logger.log({ level: "error", message: err });
      res.status(500).send("Config Not Found");
    }
  });
};
