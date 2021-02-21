const express = require("express");
const router = express.Router();
const Sonarr = require("../services/sonarr");
const Radarr = require("../services/radarr");
const fs = require("fs");
const path = require("path");
const logger = require("../util/logger");
const { adminRequired } = require("../middleware/auth");

// Sonarr
router.get("/sonarr/paths/:id", adminRequired, async (req, res) => {
  if (!req.params.id) {
    res.status(404).send();
  }
  try {
    let data = await new Sonarr(req.params.id).getPaths();

    data.forEach((el) => {
      delete el.unmappedFolders;
    });
    res.json(data);
  } catch {
    res.json([]);
  }
});

router.get("/sonarr/profiles/:id", adminRequired, async (req, res) => {
  if (!req.params.id) {
    res.status(404).send();
  }
  try {
    let data = await new Sonarr(req.params.id).getProfiles();
    res.json(data);
  } catch {
    res.json([]);
  }
});

router.get("/sonarr/test/:id", adminRequired, async (req, res) => {
  let data = {
    connection: await new Sonarr(req.params.id).test(),
  };
  res.json(data);
});

router.get("/sonarr/config", adminRequired, async (req, res) => {
  let config = new Sonarr().getConfig();
  res.json(config);
});

router.post("/sonarr/config", adminRequired, async (req, res) => {
  let data = req.body.data;
  try {
    await saveSonarrConfig(data);
    res.json(data);
    return;
  } catch (err) {
    logger.log("error", `ROUTE: Error saving sonarr config`);
    logger.error(err.stack);
    res.status(500).json({ error: err });
    return;
  }
});

function saveSonarrConfig(data) {
  return new Promise((resolve, reject) => {
    let project_folder, configFile;
    if (process.pkg) {
      project_folder = path.dirname(process.execPath);
      configFile = path.join(project_folder, "./config/sonarr.json");
    } else {
      project_folder = __dirname;
      configFile = path.join(project_folder, "../config/sonarr.json");
    }
    fs.writeFile(configFile, data, (err) => {
      if (err) {
        logger.log("error", `ROUTE: Error writing sonarr config`);
        logger.error(err.stack);
        reject(err);
      } else {
        logger.log("info", "ROUTE: Sonarr Config updated");
        resolve(data);
      }
    });
  });
}

router.get("/calendar", async (req, res) => {
  try {
    let sonarr = await new Sonarr().calendar();
    let radarr = await new Radarr().calendar();
    let full = [...sonarr, ...radarr];
    res.json(full);
  } catch (err) {
    console.trace(err);
    res.json([]);
  }
});

// Radarr

router.get("/radarr/paths/:id", adminRequired, async (req, res) => {
  if (!req.params.id) {
    res.status(404).send();
  }
  try {
    let data = await new Radarr(req.params.id).getPaths();

    data.forEach((el) => {
      delete el.unmappedFolders;
    });
    res.json(data);
  } catch (err) {
    logger.log("warn", `ROUTE: Enable to get Radarr paths`);
    logger.error(err.stack);
    res.json([]);
  }
});

router.get("/radarr/profiles/:id", adminRequired, async (req, res) => {
  if (!req.params.id) {
    res.status(404).send();
  }
  try {
    let data = await new Radarr(req.params.id).getProfiles();
    res.json(data);
  } catch {
    res.json([]);
  }
});

router.get("/radarr/test/:id", adminRequired, async (req, res) => {
  let data = {
    connection: await new Radarr(req.params.id).test(),
  };
  res.json(data);
});

router.get("/radarr/config", adminRequired, async (req, res) => {
  let config = new Radarr().getConfig();
  res.json(config);
});

router.get("/radarr/test", adminRequired, async (req, res) => {
  let data = {
    connection: await new Radarr().test(),
  };
  res.json(data);
});

router.post("/radarr/config", adminRequired, async (req, res) => {
  let data = req.body.data;
  try {
    await saveRadarrConfig(data);
    res.json(data);
    return;
  } catch (err) {
    logger.log("error", `ROUTE: Error saving radarr config`);
    logger.error(err.stack);
    res.status(500).json({ error: err });
    return;
  }
});

function saveRadarrConfig(data) {
  return new Promise((resolve, reject) => {
    let project_folder, configFile;
    if (process.pkg) {
      project_folder = path.dirname(process.execPath);
      configFile = path.join(project_folder, "./config/radarr.json");
    } else {
      project_folder = __dirname;
      configFile = path.join(project_folder, "../config/radarr.json");
    }
    fs.writeFile(configFile, data, (err) => {
      if (err) {
        logger.log("error", `ROUTE: Error writing radarr config`);
        logger.error(err.stack);
        reject(err);
      } else {
        logger.log("info", "ROUTE: Radarr Config updated");
        resolve();
      }
    });
  });
}

module.exports = router;
