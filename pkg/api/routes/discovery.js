const express = require("express");
const router = express.Router();
const logger = require("../app/logger");
const getDiscovery = require("../discovery/display");

router.get("/movies", async (req, res) => {
  let userId = req.jwtUser.altId ? req.jwtUser.altId : req.jwtUser.id;
  if (!userId) {
    res.sendStatus(404);
  }
  try {
    logger.verbose(`ROUTE: Movie Discovery Profile returned for ${userId}`);
    let data = await getDiscovery(userId, "movie");
    if (data.error) throw data.error;
    res.json(data);
  } catch (err) {
    logger.error(err);
    res.sendStatus(500);
  }
});

router.get("/shows", async (req, res) => {
  let userId = req.jwtUser.altId ? req.jwtUser.altId : req.jwtUser.id;
  if (!userId) {
    res.sendStatus(404);
  }
  try {
    logger.verbose(`ROUTE: TV Discovery Profile returned for ${userId}`);
    let data = await getDiscovery(userId, "show");
    if (data.error) throw data.error;
    res.json(data);
  } catch (err) {
    logger.error(err);
    res.sendStatus(500);
  }
});

module.exports = router;
