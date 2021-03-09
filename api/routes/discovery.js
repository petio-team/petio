const express = require("express");
const router = express.Router();
const logger = require("../util/logger");
const getDiscovery = require("../discovery/display");

router.get("/movies", async (req, res) => {
  let userId = req.jwtUser.altId ? req.jwtUser.altId : req.jwtUser.id;
  if (!userId) {
    res.sendStatus(404);
  }
  try {
    logger.log({
      level: "info",
      message: `ROUTE: Movie Discovery Profile returned for ${userId}`,
    });
    let data = await getDiscovery(userId, "movie");
    res.json(data);
  } catch (err) {
    logger.log({ level: "error", message: err });
    res.sendStatus(500);
  }
});

router.get("/shows", async (req, res) => {
  let userId = req.jwtUser.altId ? req.jwtUser.altId : req.jwtUser.id;
  if (!userId) {
    res.sendStatus(404);
  }
  try {
    logger.log({
      level: "info",
      message: `ROUTE: TV Discovery Profile returned for ${userId}`,
    });
    let data = await getDiscovery(userId, "show");
    res.json(data);
  } catch (err) {
    logger.log({ level: "error", message: err });
    res.sendStatus(500);
  }
});

module.exports = router;
