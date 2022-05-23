import { Router } from "express";
import axios from "axios";

import logger from "@/loaders/logger";
import plexLookup from "@/plex/lookup";
import { config } from "@/config/schema";
import { WriteConfig } from "@/config/config";
import MakePlexURL from "@/plex/util";
import { authRequired } from "@/api/middleware/auth";

const route = Router();

export default (app: Router) => {
  app.use("/plex", route);
  route.use(authRequired);

  route.get("/lookup/:type/:id", async (req, res) => {
    let type = req.params.type;
    let id = req.params.id;
    if (!type || !id || type === "undefined" || type === "undefined") {
      res.json({ error: "invalid" });
    } else {
      let lookup = await plexLookup(id, type);
      res.json(lookup);
    }
  });

  route.get("/test_plex", async (_req, res) => {
    const url = MakePlexURL("/").toString();
    try {
      await axios.get(
        `https://plex.tv/pms/resources?X-Plex-Token=${config.get("plex.token")}`
      );
      let connection = await axios.get(url);
      let data = connection.data.MediaContainer;
      if (
        data.myPlexUsername === config.get("admin.username") ||
        data.myPlexUsername === config.get("admin.email")
      ) {
        await updateCredentials({ plexClientID: data.machineIdentifier });
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
};

async function updateCredentials(obj) {
  if (obj.plexClientID == undefined) {
    throw "plex client id does not exist in object";
  }

  config.set("plex.client", obj.plexClientID);
  try {
    await WriteConfig();
  } catch (err) {
    logger.log({ level: "error", message: err });
    logger.error("PLX: Error config not found");
  }
}
