import express from "express";

import logger from "../app/logger";
import { adminRequired  } from "../middleware/auth";
import { conf, WriteConfig } from "../app/config";

const router = express.Router();
router.use(adminRequired);
router.post("/update", async (req, res) => {
  let body = req.body;

  if (body.plexToken != undefined) {
    conf.set('plex.token', body.plexToken);
  }
  if (body.base_path != undefined) {
    conf.set('petio.subpath', body.base_path);
  }
  if (body.login_type != undefined) {
    conf.set('auth.type', body.login_type);
  }
  if (body.plexPopular != undefined) {
    conf.set('general.popular', body.plexPopular);
  }
  if (body.telegram_bot_token != undefined) {
    conf.set('notifications.telegram.token', body.telegram_bot_token);
  }
  if (body.telegram_chat_id != undefined) {
    conf.set('notifications.telegram.id', body.telegram_chat_id);
  }
  if (body.telegram_send_silently != undefined) {
    conf.set('notifications.telegram.silent', body.telegram_send_silently);
  }
  if (body.discord_webhook != undefined) {
    conf.set('notifications.discord.url', body.discord_webhook);
  }

  try {
    await WriteConfig();
  } catch (err) {
    logger.error(err);
    res.status(500).send("Config Not Found");
  }

  res.status(200).send("config updated");
});

router.get("/current", async (req, res) => {
  try {
    const json = {
      base_path: conf.get('petio.subpath'),
      login_type: conf.get('auth.type'),
      plexPopular: conf.get('general.popular'),
      discord_webhook: conf.get('notifications.discord.url'),
      telegram_bot_token: conf.get('notifications.telegram.token'),
      telegram_chat_id: conf.get('notifications.telegram.id'),
      telegram_send_silently: conf.get('notifications.telegram.silent'),
    };
    res.json(json);
  } catch (err) {
    logger.log("error", "ROUTE: Config error");
    logger.log({ level: "error", message: err });
    res.status(500).send("Config Not Found");
  }
});

export default router;