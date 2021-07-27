import express from "express";
const router = express.Router();
import fs from "fs";
import path from "path";
import logger from "../util/logger";
import {adminRequired} from "../middleware/auth";

router.use(adminRequired);
router.post("/update", async (req, res) => {
  let body = req.body;

  let project_folder, configFile;
  if (process.pkg) {
    project_folder = path.dirname(process.execPath);
    configFile = path.join(project_folder, "./config/config.json");
  } else {
    project_folder = __dirname;
    configFile = path.join(project_folder, "../config/config.json");
  }

  let userConfig = false;
  try {
    userConfig = fs.readFileSync(configFile);
    let configParse = JSON.parse(userConfig);
    let updatedConfig = JSON.stringify({ ...configParse, ...body });
    fs.writeFile(configFile, updatedConfig, (err) => {
      if (err) {
        logger.log({ level: "error", message: err });
        res.status(500).send("Error updating config");
      } else {
        res.status(200).send("Config updated");
      }
    });
    // return JSON.parse(userConfig);
  } catch (err) {
    logger.log({ level: "error", message: err });
    res.status(500).send("Config Not Found");
  }
});

router.get("/current", async (req, res) => {
  let project_folder, configFile;
  if (process.pkg) {
    project_folder = path.dirname(process.execPath);
    configFile = path.join(project_folder, "./config/config.json");
  } else {
    project_folder = __dirname;
    configFile = path.join(project_folder, "../config/config.json");
  }
  try {
    userConfig = fs.readFileSync(configFile);
    let configParse = JSON.parse(userConfig);
    delete configParse.plexProtocol;
    delete configParse.plexIp;
    delete configParse.plexPort;
    delete configParse.plexToken;
    delete configParse.plexClientID;
    delete configParse.adminUsername;
    delete configParse.adminEmail;
    configParse.adminPass = true;
    delete configParse.adminId;
    delete configParse.adminDisplayName;
    res.json(configParse);
  } catch (err) {
    logger.log("error", "ROUTE: Config error");
    logger.log({ level: "error", message: err });
    res.status(500).send("Config Not Found");
  }
});

export default router;
