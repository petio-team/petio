import express from "express";
import Sonarr from "../services/sonarr";
import Radarr from "../services/radarr";
import logger from "../app/logger";
import { adminRequired  } from "../middleware/auth";
import { conf, WriteConfig } from "../app/config";

const router = express.Router();

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

router.get("/sonarr/languages/:id", adminRequired, async (req, res) => {
  if (!req.params.id) {
    res.status(404).send();
  }
  try {
    let data = await new Sonarr().getLanguageProfiles(req.params.id);
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

router.get("/radarr/languages/:id", adminRequired, async (req, res) => {
  if (!req.params.id) {
    res.status(404).send();
  }
  try {
    let data = await new Radarr(req.params.id).getLanguageProfiles();
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

  const data: any = [];
  for (const [_, i] of Object.entries(obj)) {
    const val: any = i;
    const item: any = {};
    item.enabled = Boolean(val.enabled);
    item.title = String(val.title);
    item.protocol = String(val.protocol);
    item.host = val.host;
    item.port = parseInt(val.port);
    item.key = val.key;
    item.subpath = String(val.subpath);
    if (val.subpath == "") {
      item.subpath = "/";
    }

    item.path = {};
    if (val.path.id != null) {
      item.path.id = Number(val.path.id);
    } else {
      item.path.id = null;
    }
    if (val.path.location != undefined) {
      item.path.location = String(val.path.location);
    } else {
      item.path.location = "";
    }

    item.profile = {};
    if (val.profile.id != null) {
      item.profile.id = Number(val.profile.id);
    } else {
      item.profile.id = null;
    }
    if (val.profile.name != undefined) {
      item.profile.name = String(val.profile.name);
    } else {
      item.profile.name = "";
    }

    item.language = {};
    if (val.language.id != null) {
      item.language.id = Number(val.language.id);
    } else {
      item.language.id = null;
    }
    if (val.language.name != undefined) {
      item.language.name = String(val.language.name);
    } else {
      item.language.name = "";
    }

    item.uuid = val.uuid;
    data.push(item);
  };

  conf.set(entry, data);
};

export default router;