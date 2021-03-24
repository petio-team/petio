require("dotenv/config");
const express = require("express");
const router = express.Router();
const plexLookup = require("../plex/plexLookup");
const getConfig = require("../util/config");
const logger = require("../util/logger");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

router.get("/lookup/:type/:id", async (req, res) => {
  let type = req.params.type;
  let id = req.params.id;
  if (!type || !id || type === "undefined" || type === "undefined") {
    res.json({ error: "invalid" });
  } else {
    let lookup = await plexLookup(id, type);
    res.json(lookup);
  }
});

router.get("/test_plex", async (req, res) => {
  const prefs = getConfig();
  let url = `${prefs.plexProtocol}://${prefs.plexIp}:${prefs.plexPort}?X-Plex-Token=${prefs.plexToken}`;
  try {
    let connection = await axios.get(url);
    let data = connection.data.MediaContainer;
    console.log(connection.data);
    if (
      data.myPlexUsername === prefs.adminUsername ||
      data.myPlexUsername === prefs.adminEmail
    ) {
      updateCredentials({ plexClientID: data.machineIdentifier });
      res.json({
        connection: true,
        error: false,
      });
      return;
    } else {
      res.json({
        connection: false,
        error: "You are not the owner of this server",
      });
      return;
    }
  } catch (err) {
    logger.log({ level: "error", message: err });
    res.json({
      connection: false,
      error: "Plex connection test failed",
    });
  }
});

function updateCredentials(obj) {
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
    let updatedConfig = JSON.stringify({ ...configParse, ...obj });
    fs.writeFile(configFile, updatedConfig, (err) => {
      if (err) {
        logger.log({ level: "error", message: err });
        logger.error("PLX: Error updating config");
      } else {
        logger.info("PLX: Config Updated");
      }
    });
    // return JSON.parse(userConfig);
  } catch (err) {
    logger.log({ level: "error", message: err });
    logger.error("PLX: Error config not found");
  }
}

module.exports = router;
