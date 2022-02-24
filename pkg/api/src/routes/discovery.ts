import express from "express";

import logger from "../app/logger";
import getDiscovery from "../discovery/display";

const router = express.Router();

router.get("/movies", async (req, res) => {
  let userId = req.jwtUser.altId ? req.jwtUser.altId : req.jwtUser.id;
  if (!userId) {
    res.sendStatus(404);
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

router.get("/shows", async (req, res) => {
  let userId = req.jwtUser.altId ? req.jwtUser.altId : req.jwtUser.id;
  if (!userId) {
    res.sendStatus(404);
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

export default router;