import express from "express";

import Mailer from "../mail/mailer";
import logger from "../app/logger";
import { adminRequired  } from "../middleware/auth";
import { conf, WriteConfig } from "../app/config";

const router = express.Router();
router.use(adminRequired);
router.post("/create", async (req, res) => {
  let email = req.body.email;

  if (!email) {
    res.status(400).send("Missing Fields");
    logger.log("error", "MAILER: Update email config failed");
    return;
  }

  conf.set('email.enabled', email.enabled);
  conf.set('email.username', email.user);
  conf.set('email.password', email.pass);
  conf.set('email.host', email.server);
  conf.set('email.port', email.port);
  conf.set('email.ssl', email.secure);
  conf.set('email.from', email.from);

  try {
    WriteConfig();
  } catch (e) {
    logger.error(e);
    res.status(500).send("failed to write config to filesystem");
    return;
  }

  logger.log("verbose", "MAILER: Config updated");
  res.json({ config: conf.get('email') });
});

router.get("/config", async (req, res) => {
  res.json({
    config: {
      emailEnabled: conf.get('email.enabled'),
      emailUser: conf.get('email.username'),
      emailPass: conf.get('email.password'),
      emailServer: conf.get('email.host'),
      emailPort: conf.get('email.port'),
      emailSecure: conf.get('email.ssl'),
      emailFrom: conf.get('email.from'),
    },
  });
});

router.get("/test", async (req, res) => {
  let test = await new Mailer().test();
  res.json({ result: test.result, error: test.error });
});

export default router;