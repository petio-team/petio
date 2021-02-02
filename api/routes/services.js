const express = require("express");
const router = express.Router();
const Sonarr = require("../services/sonarr");
const Radarr = require("../services/radarr");
const fs = require("fs");
const path = require("path");

// Sonnarr

router.get("/sonarr/paths/:id", async (req, res) => {
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

router.get("/sonarr/profiles/:id", async (req, res) => {
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

router.get("/sonarr/test/:id", async (req, res) => {
  let data = {
    connection: await new Sonarr(req.params.id).test(),
  };
  res.json(data);
});

router.get("/sonarr/config", async (req, res) => {
  let config = new Sonarr().getConfig();
  res.json(config);
});

router.post("/sonarr/config", async (req, res) => {
  let data = req.body.data;
  try {
    await saveSonarrConfig(data);
    res.json(data);
    return;
  } catch (err) {
    console.log(err);
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
        console.log(err);
        reject(err);
      } else {
        console.log("Sonarr Config updated");
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
  } catch {
    res.json([]);
  }
});

// Radarr

router.get("/radarr/paths/:id", async (req, res) => {
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
    console.log(err);
    res.json([]);
  }
});

router.get("/radarr/profiles/:id", async (req, res) => {
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

router.get("/radarr/test/:id", async (req, res) => {
  let data = {
    connection: await new Radarr(req.params.id).test(),
  };
  res.json(data);
});

router.get("/radarr/config", async (req, res) => {
  let config = new Radarr().getConfig();
  res.json(config);
});

router.get("/radarr/test", async (req, res) => {
  let data = {
    connection: await new Radarr().test(),
  };
  res.json(data);
});

router.post("/radarr/config", async (req, res) => {
  let data = req.body.data;
  try {
    await saveRadarrConfig(data);
    res.json(data);
    return;
  } catch (err) {
    console.log(err);
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
        console.log(err);
        reject(err);
      } else {
        console.log("Radarr Config updated");
        resolve();
      }
    });
  });
}

module.exports = router;
