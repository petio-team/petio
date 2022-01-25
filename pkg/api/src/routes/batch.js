const express = require("express");
const router = express.Router();
const logger = require("../app/logger");
const { movieLookup } = require("../tmdb/movie");
const { showLookup } = require("../tmdb/show");

router.post("/movie", async (req, res) => {
  const ids = req.body.ids;
  const min = req.body.min === undefined ? true : req.body.min;
  let output = await Promise.all(
    ids.map(async (id) => {
      if (!id) return;
      const movie = await movieLookup(id, min);
      return movie;
    })
  );
  res.json(output);
});

router.post("/tv", async (req, res) => {
  const ids = req.body.ids;
  const min = req.body.min === undefined ? true : req.body.min;
  let output = await Promise.all(
    ids.map(async (id) => {
      if (!id) return;
      const movie = await showLookup(id, min);
      return movie;
    })
  );
  res.json(output);
});

module.exports = router;
