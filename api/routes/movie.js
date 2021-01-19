const express = require("express");
const router = express.Router();
const movieLookup = require("../tmdb/movie");

router.get("/lookup/:id", async (req, res) => {
  let data = await movieLookup(req.params.id);
  res.json(data);
});

router.get("/lookup/:id/minified", async (req, res) => {
  let data = await movieLookup(req.params.id, true);
  res.json(data);
});

module.exports = router;
