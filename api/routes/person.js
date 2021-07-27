import express from "express";
const router = express.Router();
import personLookup from "../tmdb/person";
import ExpressCache from "express-cache-middleware";
import cacheManager from "cache-manager";

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
