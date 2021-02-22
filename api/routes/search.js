const express = require("express");
const router = express.Router();
const search = require("../tmdb/search");

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
    let data = await search(req.params.term.replace(/[^a-zA-Z ]/g, ""));
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({
      movies: [],
      people: [],
      shows: [],
    });
  }
});

module.exports = router;
