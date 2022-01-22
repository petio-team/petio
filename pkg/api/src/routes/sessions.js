const express = require("express");
const router = express.Router();
const getSessions = require("../plex/sessions");
const logger = require("../app/logger");
const { adminRequired } = require("../middleware/auth");

router.use(adminRequired);
router.get("/", async (req, res) => {
  try {
    let data = await getSessions();
    res.json(data.MediaContainer);
  } catch (err) {
    logger.log("warn", "ROUTE: Unable to get sessions");
    logger.log({ level: "error", message: err });
    res.status(500).send();
  }
});

module.exports = router;
