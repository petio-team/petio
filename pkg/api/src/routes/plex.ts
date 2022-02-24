import express from "express";
import axios from "axios";

import plexLookup from "../plex/plexLookup";
import { conf, WriteConfig } from "../app/config";
import logger from "../app/logger";
import MakePlexURL from '../plex/util';

const router = express.Router();

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
  const url = MakePlexURL("/").toString();
  try {
    await axios.get(
      `https://plex.tv/pms/resources?X-Plex-Token=${conf.get('plex.token')}`
    );
    let connection = await axios.get(url);
    let data = connection.data.MediaContainer;
    if (
      data.myPlexUsername === conf.get('admin.username') ||
      data.myPlexUsername === conf.get('admin.email')
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
  if (obj.plexClientID == undefined) {
    throw "plex client id does not exist in object";
  }

  conf.set('plex.client', obj.plexClientID);
  try {
    WriteConfig();
  } catch (err) {
    logger.log({ level: "error", message: err });
    logger.error("PLX: Error config not found");
  }
}

export default router;