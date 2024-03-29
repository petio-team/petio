const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const Mailer = require("../mail/mailer");
const logger = require("../util/logger");
const { adminRequired } = require("../middleware/auth");

router.use(adminRequired);
router.post("/create", async (req, res) => {
  let email = req.body.email;

  if (!email) {
    res.status(500).send("Missing Fields");
    logger.log("error", "MAILER: Create email config failed");
    return;
  }
  logger.log("info", "MAILER: Creating email config");
  let configData = {
    emailEnabled: email.enabled,
    emailUser: email.user,
    emailPass: email.pass,
    emailServer: email.server,
    emailPort: email.port,
    emailSecure: email.secure,
    emailFrom: email.from,
  };
  configData = JSON.stringify(configData);
  let config = await createConfig(configData);
  if (config) {
    logger.log("info", "MAILER: Config created");
    res.json({ config: config });
  } else {
    logger.log("error", "MAILER: Config failed to create");
  }
});

router.get("/config", async (req, res) => {
  let config = await getConfig();
  let data = false;
  if (!config) {
    data = {
      emailEnabled: false,
      emailUser: "",
      emailPass: "",
      emailServer: "",
      emailPort: "",
      emailSecure: false,
      emailFrom: "",
    };
  } else {
    data = {
      emailEnabled: config.emailEnabled,
      emailUser: config.emailUser,
      emailPass: config.emailPass,
      emailServer: config.emailServer,
      emailPort: config.emailPort,
      emailSecure: config.emailSecure,
      emailFrom: config.emailFrom,
    };
  }
  res.json({
    config: data,
  });
});

router.get("/test", async (req, res) => {
  let test = await new Mailer().test();
  res.json({ result: test.result, error: test.error });
});

function getConfig() {
  return new Promise((resolve, reject) => {
    let project_folder, configFile;
    if (process.pkg) {
      project_folder = path.dirname(process.execPath);
      configFile = path.join(project_folder, "./config/email.json");
    } else {
      project_folder = __dirname;
      configFile = path.join(project_folder, "../config/email.json");
    }

    fs.readFile(configFile, "utf8", (err, data) => {
      if (err) {
        logger.log("info", err);
        resolve(false);
        return;
      }
      resolve(JSON.parse(data));
    });
  });
}

function createConfig(data) {
  return new Promise((resolve, reject) => {
    let project_folder, configFile;
    if (process.pkg) {
      project_folder = path.dirname(process.execPath);
      configFile = path.join(project_folder, "./config/email.json");
    } else {
      project_folder = __dirname;
      configFile = path.join(project_folder, "../config/email.json");
    }

    fs.writeFile(configFile, data, (err) => {
      if (err) {
        logger.log("info", err);
        resolve(false);
      }
      resolve(true);
    });
  });
}

module.exports = router;
