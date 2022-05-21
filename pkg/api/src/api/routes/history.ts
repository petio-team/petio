import { Router } from "express";

import getHistory from "@/plex/history";
import getBandwidth from "@/plex/bandwidth";
import getServerInfo from "@/plex/serverInfo";
import logger from "@/loaders/logger";
import { authRequired } from "@/api/middleware/auth";

const route = Router();

export default (app: Router) => {
  app.use("/history", route);
  route.use(authRequired);

  route.post("/", async (req, res) => {
    let id = req.body.id;
    if (id === "admin") id = 1;
    try {
      let data = await getHistory(id, req.body.type);
      res.json(data);
    } catch (err) {
      logger.log("warn", "ROUTE: Error getting history");
      logger.log({ level: "error", message: err });
      res.status(500).send();
    }
  });

  route.get("/bandwidth", async (_req, res) => {
    try {
      let data = await getBandwidth();
      res.json(data);
    } catch (err) {
      logger.log("warn", "ROUTE: Error getting bandwidth");
      logger.log({ level: "error", message: err });
      res.status(500).send();
    }
  });

  route.get("/server", async (_req, res) => {
    try {
      let data = await getServerInfo();
      res.json(data.MediaContainer);
    } catch (err) {
      logger.log("warn", "ROUTE: Error getting server info");
      logger.log({ level: "error", message: err });
      res.status(500).send();
    }
  });
};
