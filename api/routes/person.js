const express = require("express");
const router = express.Router();
const personLookup = require("../tmdb/person");

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

router.get("/lookup/:id", async (req, res) => {
  let data = await personLookup(req.params.id);
  res.json(data);
});

module.exports = router;
