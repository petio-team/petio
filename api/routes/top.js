const express = require("express");
const router = express.Router();
const getTop = require("../plex/top");

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

cacheMiddleware.attach(router);

router.get("/movies", async (req, res) => {
  let data = await getTop(1);
  res.json(data);
});

router.get("/shows", async (req, res) => {
  let data = await getTop(2);
  res.json(data);
});

module.exports = router;
