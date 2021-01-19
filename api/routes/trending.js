const express = require("express");
const router = express.Router();
const trending = require("../tmdb/trending");

router.get("/", async (req, res) => {
  let data = await trending();
  res.json(data);
});

module.exports = router;
