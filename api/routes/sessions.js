const express = require("express");
const router = express.Router();
const getSessions = require("../plex/sessions");
const logger = require("../util/logger");

router.get("/", async (req, res) => {
  try {
    let data = await getSessions();
    res.json(data.MediaContainer);
  } catch (err) {
    logger.log("warn", "ROUTE: Unable to get sessions");
    logger.log("warn", err);
    res.status(500).send();
  }
});

module.exports = router;
