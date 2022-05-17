import express from "express";

import getHistory from "../plex/history";
import getBandwidth from "../plex/bandwidth";
import getServerInfo from "../plex/serverInfo";
import logger from "../app/logger";

const router = express.Router();

router.post("/", async (req, res) => {
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

router.get("/bandwidth", async (req, res) => {
  try {
    let data = await getBandwidth();
    res.json(data);
  } catch (err) {
    logger.log("warn", "ROUTE: Error getting bandwidth");
    logger.log({ level: "error", message: err });
    res.status(500).send();
  }
});

router.get("/server", async (req, res) => {
  try {
    let data = await getServerInfo();
    res.json(data.MediaContainer);
  } catch (err) {
    logger.log("warn", "ROUTE: Error getting server info");
    logger.log({ level: "error", message: err });
    res.status(500).send();
  }
});

export default router;
