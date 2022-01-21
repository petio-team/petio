const express = require("express");
const router = express.Router();
const logger = require("../app/logger");
const { movieLookup } = require("../tmdb/movie");
const showLookup = require("../tmdb/show");

router.post("/movie", async (req, res) => {
  const ids = req.body.ids;
  let output = await Promise.all(
    ids.map(async (id) => {
      if (!id) return;
      const movie = await movieLookup(id, true);
      return movie;
    })
  );
  res.json(output);
});

module.exports = router;
