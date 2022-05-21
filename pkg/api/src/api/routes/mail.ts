import { Router } from "express";

import Mailer from "@/mail/mailer";
import logger from "@/loaders/logger";
import { adminRequired } from "@/api/middleware/auth";
import { conf, WriteConfig } from "@/app/config";

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

    conf.set("email.enabled", email.enabled);
    conf.set("email.username", email.user);
    conf.set("email.password", email.pass);
    conf.set("email.host", email.server);
    conf.set("email.port", email.port);
    conf.set("email.ssl", email.secure);
    conf.set("email.from", email.from);

    try {
      await WriteConfig();
    } catch (e) {
      logger.error(e);
      res.status(500).send("failed to write config to filesystem");
      return;
    }

    logger.log("verbose", "MAILER: Config updated");
    res.json({ config: conf.get("email") });
  });

  route.get("/config", async (_req, res) => {
    res.json({
      config: {
        emailEnabled: conf.get("email.enabled"),
        emailUser: conf.get("email.username"),
        emailPass: conf.get("email.password"),
        emailServer: conf.get("email.host"),
        emailPort: conf.get("email.port"),
        emailSecure: conf.get("email.ssl"),
        emailFrom: conf.get("email.from"),
      },
    });
  });

  route.get("/test", async (_req, res) => {
    let test = await new Mailer().test();
    res.json({ result: test.result, error: test.error });
  });
};
