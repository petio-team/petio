const express = require("express");
const router = express.Router();
const logger = require("../util/logger");
const getDiscovery = require("../discovery/display");

router.get("/me", async (req, res) => {
  let userId = req.jwtUser.id;
  if (!userId) {
    res.sendStatus(404);
  }
  try {
    logger.log({
      level: "info",
      message: `Discovery Profile returned for ${userId}`,
    });
    let data = await getDiscovery(userId);
    res.json(data);
  } catch (err) {
    logger.log({ level: "error", message: err });
    res.sendStatus(500);
  }
});

module.exports = router;
