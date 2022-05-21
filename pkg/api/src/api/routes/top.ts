import { Router } from "express";
import ExpressCache from "express-cache-middleware";
import cacheManager from "cache-manager";

import getTop from "@/plex/top";
import { authRequired } from "@/api/middleware/auth";

// Cache for 1 day
const cacheMiddleware = new ExpressCache(
  cacheManager.caching({
    store: "memory",
    max: 100,
    ttl: 86400,
  })
);

const route = Router();
cacheMiddleware.attach(route);

export default (app: Router) => {
  app.use("/top", route);
  route.use(authRequired);

  route.get("/movies", async (req, res) => {
    let data = await getTop(1);
    res.json(data);
  });

  route.get("/shows", async (req, res) => {
    let data = await getTop(2);
    res.json(data);
  });
};
