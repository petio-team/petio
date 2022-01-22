const express = require("express");
const router = express.Router();
const search = require("../tmdb/search");
const MusicMeta = require("../meta/musicBrainz");
const ExpressCache = require("express-cache-middleware");
const cacheManager = require("cache-manager");

// Cache for 1 day
const cacheMiddleware = new ExpressCache(
  cacheManager.caching({
    store: "memory",
    max: 100,
    ttl: 86400,
  })
);

// Caching not applied needs setting up

router.get("/:term", async (req, res) => {
  try {
    let data = await search(req.params.term.replace(/[^a-zA-Z0-9 ]/g, ""));
    res.json(data);
  } catch (err) {
    logger.error(err);
    res.json({
      movies: [],
      people: [],
      shows: [],
    });
  }
});

router.get("/music/:term", async (req, res) => {
  new MusicMeta().search(req.params.term);
});

module.exports = router;
