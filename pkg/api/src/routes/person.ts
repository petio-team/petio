import express from "express";
import ExpressCache from "express-cache-middleware";
import cacheManager from "cache-manager";

import personLookup from "../tmdb/person";

const router = express.Router();

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

export default router;
