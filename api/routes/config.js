const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

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
        console.log(err);
        res.status(500).send("Error updating config");
      } else {
        res.status(200).send("Config updated");
      }
    });
    // return JSON.parse(userConfig);
  } catch (err) {
    console.log(err);
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
    console.log(err);
    res.status(500).send("Config Not Found");
  }
});

module.exports = router;
