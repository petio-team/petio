const express = require("express");
const router = express.Router();
const getHistory = require("../plex/history");
const getBandwidth = require("../plex/bandwidth");
const getServerInfo = require("../plex/serverInfo");
const logger = require("../util/logger");

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
    res.json(data.MediaContainer.StatisticsBandwidth);
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

module.exports = router;
