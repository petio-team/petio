import { Router } from "express";
import ExpressCache from "express-cache-middleware";
import cacheManager from "cache-manager";

import personLookup from "@/tmdb/person";
import { authRequired } from "@/api/middleware/auth";

const cacheMiddleware = new ExpressCache(
  cacheManager.caching({
    store: "memory",
    max: 100,
    ttl: 86400, // Cache for 1 day
  })
);
const route = Router();
cacheMiddleware.attach(route);

export default (app: Router) => {
  app.use("/person", route);
  route.use(authRequired);

  route.get("/lookup/:id", async (req, res) => {
    let data = await personLookup(req.params.id);
    res.json(data);
  });
};
