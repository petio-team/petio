const express = require("express");
const router = express.Router();
const getHistory = require("../plex/history");
const getBandwidth = require("../plex/bandwidth");
const getServerInfo = require("../plex/serverInfo");
const logger = require("../util/logger");

router.post("/", async (req, res) => {
  let id = req.body.id;
  if (id === "admin") id = 1;
  let data = await getHistory(id, req.body.type);
  res.json(data);
});

router.get("/bandwidth", async (req, res) => {
  try {
    let data = await getBandwidth();
    res.json(data.MediaContainer.StatisticsBandwidth);
  } catch (err) {
    logger.log("warn", "ROUTE: Error getting bandwidth");
    logger.error(err.stack);
    res.status(500).send();
  }
});

router.get("/server", async (req, res) => {
  try {
    let data = await getServerInfo();
    res.json(data.MediaContainer);
  } catch (err) {
    logger.log("warn", "ROUTE: Error getting server info");
    logger.error(err.stack);
    res.status(500).send();
  }
});

module.exports = router;
