import { Router } from "express";

import Mailer from "@/mail/mailer";
import logger from "@/loaders/logger";
import { adminRequired } from "@/api/middleware/auth";
import { WriteConfig } from "@/config/config";
import { config } from "@/config/schema";

const route = Router();

export default (app: Router) => {
  app.use("/mail", route);
  route.use(adminRequired);
  route.post("/create", async (req, res) => {
    let email = req.body.email;

    if (!email) {
      res.status(400).send("Missing Fields");
      logger.log("error", "MAILER: Update email config failed");
      return;
    }

    config.set("email.enabled", email.enabled);
    config.set("email.username", email.user);
    config.set("email.password", email.pass);
    config.set("email.host", email.server);
    config.set("email.port", email.port);
    config.set("email.ssl", email.secure);
    config.set("email.from", email.from);

    try {
      await WriteConfig();
    } catch (e) {
      logger.error(e);
      res.status(500).send("failed to write config to filesystem");
      return;
    }

    logger.log("verbose", "MAILER: Config updated");
    res.json({ config: config.get("email") });
  });

  route.get("/config", async (_req, res) => {
    res.json({
      config: {
        emailEnabled: config.get("email.enabled"),
        emailUser: config.get("email.username"),
        emailPass: config.get("email.password"),
        emailServer: config.get("email.host"),
        emailPort: config.get("email.port"),
        emailSecure: config.get("email.ssl"),
        emailFrom: config.get("email.from"),
      },
    });
  });

  route.get("/test", async (_req, res) => {
    let test = await new Mailer().test();
    res.json({ result: test.result, error: test.error });
  });
};
