const express = require("express");
const router = express.Router();
const Sonarr = require("../services/sonarr");
const Radarr = require("../services/radarr");
const fs = require("fs");
const path = require("path");
const logger = require("../app/logger");
const { adminRequired } = require("../middleware/auth");
const { conf, WriteConfig } = require("../app/config");

// Sonarr
router.get("/sonarr/paths/:id", adminRequired, async (req, res) => {
  if (!req.params.id) {
    res.status(404).send();
  }
  try {
    let data = await new Sonarr().getPaths(req.params.id);

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
    let data = await new Sonarr().getProfiles(req.params.id);
    res.json(data);
  } catch {
    res.json([]);
  }
});

router.get("/sonarr/tags/:id", adminRequired, async (req, res) => {
  if (!req.params.id) {
    res.status(404).send();
  }
  try {
    let data = await new Sonarr().getTags(req.params.id);
    res.json(data);
  } catch {
    res.json([]);
  }
});

router.get("/sonarr/test/:id", adminRequired, async (req, res) => {
  let data = {
    connection: await new Sonarr().test(req.params.id),
  };
  res.json(data);
});

router.get("/sonarr/config", adminRequired, async (req, res) => {
  let config = new Sonarr().getConfig();
  res.json(config);
});

router.post("/sonarr/config", adminRequired, async (req, res) => {
  let data = req.body.data;
  ConvertToConfig('sonarr', JSON.parse(data));

  try {
    WriteConfig();
    res.json(data);
    return;
  } catch (err) {
    logger.log("error", `ROUTE: Error saving sonarr config`);
    logger.log({ level: "error", message: err });
    res.status(500).json({ error: err });
    return;
  }
});

router.delete("/sonarr/:uuid", adminRequired, async (req, res) => {
  let uuid = req.params.uuid;
  if (uuid == undefined) {
    res.status(400).json({
      status: 'error',
      error: 'missing the required `uuid` field',
      message: null,
      data: {},
    });
    return;
  }

  let sonarrs = conf.get('sonarr');
  const match = sonarrs.filter((el) => el.uuid == uuid);
  if (match.length == 0) {
    res.status(400).json({
      status: 'error',
      error: 'no matching instance exists with the uuid: ' + uuid,
      message: null,
      data: {},
    });
    return;
  }

  sonarrs = sonarrs.filter((el) => el.uuid != uuid);
  conf.set('sonarr', sonarrs);

  try {
    await WriteConfig();
  } catch (e) {
    logger.error(e);
    res.status(500).json({
      status: 'error',
      error: 'failed to write to config file',
      message: null,
      data: {},
    });
    return;
  }

  res.status(200).json({
    status: 'success',
    error: null,
    message: 'instance successfully removed',
    data: sonarrs,
  });
  return;
});


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
    logger.log({ level: "error", message: err });
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

router.get("/radarr/tags/:id", adminRequired, async (req, res) => {
  if (!req.params.id) {
    res.status(404).send();
  }
  try {
    let data = await new Radarr(req.params.id).getTags();
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
  ConvertToConfig('radarr', JSON.parse(data));

  try {
    WriteConfig();
    res.json(data);
    return;
  } catch (err) {
    logger.log("error", `ROUTE: Error saving radarr config`);
    logger.log({ level: "error", message: err });
    res.status(500).json({ error: err });
    return;
  }
});

router.delete("/radarr/:uuid", adminRequired, async (req, res) => {
  let uuid = req.params.uuid;
  if (uuid == undefined) {
    res.status(400).json({
      status: 'error',
      error: 'missing the required `uuid` field',
      message: null,
      data: {},
    });
    return;
  }

  let radarrs = conf.get('radarr');
  const match = radarrs.filter((el) => el.uuid == uuid);
  if (match.length == 0) {
    res.status(400).json({
      status: 'error',
      error: 'no matching instance exists with the uuid: ' + uuid,
      message: null,
      data: {},
    });
    return;
  }

  radarrs = radarrs.filter((el) => el.uuid != uuid);
  conf.set('radarr', radarrs);

  try {
    await WriteConfig();
  } catch (e) {
    logger.error(e);
    res.status(500).json({
      status: 'error',
      error: 'failed to write to config file',
      message: null,
      data: {},
    });
    return;
  }

  res.status(200).json({
    status: 'success',
    error: null,
    message: 'instance successfully removed',
    data: radarrs,
  });
  return;
});

const ConvertToConfig = (entry, obj) => {
  if (obj == null || typeof obj !== 'object') {
    return;
  }

  if (obj.length == 0) {
    return;
  }

  const data = [];
  for (const [_, i] of Object.entries(obj)) {
    const item = {};
    item.enabled = Boolean(i.enabled);
    item.title = String(i.title);
    item.protocol = String(i.protocol);
    item.host = i.host;
    item.port = parseInt(i.port);
    item.key = i.key;
    item.subpath = String(i.subpath);
    if (i.subpath == "") {
      item.subpath = "/";
    }

    item.path = {};
    if (i.path.id != null) {
      item.path.id = Number(i.path.id);
    } else {
      item.path.id = null;
    }
    if (i.path.location != undefined) {
      item.path.location = String(i.path.location);
    } else {
      item.path.location = "";
    }

    item.profile = {};
    if (i.profile.id != null) {
      item.profile.id = Number(i.profile.id);
    } else {
      item.profile.id = null;
    }
    if (i.profile.name != undefined) {
      item.profile.name = String(i.profile.name);
    } else {
      item.profile.name = "";
    }
    item.uuid = i.uuid;

    data.push(item);
  };

  conf.set(entry, data);
};

module.exports = router;