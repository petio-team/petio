import { Router } from "express";

import logger from "@/loaders/logger";
import getDiscovery from "@/discovery/display";
import { authRequired } from "@/api/middleware/auth";

const route = Router();

export default (app: Router) => {
  app.use("/discovery", route);
  route.use(authRequired);

  route.get("/movies", async (req: any, res) => {
    let userId = req.jwtUser.altId ? req.jwtUser.altId : req.jwtUser.id;
    if (!userId) {
      res.sendStatus(404);
      return;
    }
    try {
      logger.verbose(`ROUTE: Movie Discovery Profile returned for ${userId}`);
      let data: any = await getDiscovery(userId, "movie");
      if (data.error) throw data.error;
      res.json(data);
    } catch (err) {
      logger.error(err);
      res.sendStatus(500);
    }
  });

  route.get("/shows", async (req: any, res) => {
    let userId = req.jwtUser.altId ? req.jwtUser.altId : req.jwtUser.id;
    if (!userId) {
      res.sendStatus(404);
      return;
    }
    try {
      logger.verbose(`ROUTE: TV Discovery Profile returned for ${userId}`);
      let data: any = await getDiscovery(userId, "show");
      if (data.error) throw data.error;
      res.json(data);
    } catch (err) {
      logger.error(err);
      res.sendStatus(500);
    }
  });
};
