import express from "express";
import ExpressCache from "express-cache-middleware";
import cacheManager from "cache-manager";

import getTop from "../plex/top";

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

router.get("/movies", async (req, res) => {
  let data = await getTop(1);
  res.json(data);
});

router.get("/shows", async (req, res) => {
  let data = await getTop(2);
  res.json(data);
});

export default router;
