const express = require("express");
const router = express.Router();
const { movieLookup, discoverMovie } = require("../tmdb/movie");

router.get("/lookup/:id", async (req, res) => {
  let data = await movieLookup(req.params.id);
  res.json(data);
});

router.get("/lookup/:id/minified", async (req, res) => {
  let data = await movieLookup(req.params.id, true);
  res.json(data);
});

router.post("/discover", async (req, res) => {
  let page = req.body.page ? req.body.page : 1;
  let params = req.body.params;
  let data = await discoverMovie(page, params);
  res.json(data);
});

module.exports = router;
