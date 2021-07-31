import express from "express";
const router = express.Router();
import logger from "../util/logger";
import getDiscovery from "../discovery/display";

router.get("/movies", async (req, res) => {
  let userId = req.jwtUser.altId ? req.jwtUser.altId : req.jwtUser.id;
  if (!userId) {
    res.sendStatus(404);
  }
  try {
    logger.log({
      level: "info",
      message: `ROUTE: Movie Discovery Profile returned for ${userId}`,
    });
    let data = await getDiscovery(userId, "movie");
    if (data.error) throw data.error;
    res.json(data);
  } catch (err) {
    logger.log({ level: "error", message: err });
    res.sendStatus(500);
  }
});

router.get("/shows", async (req, res) => {
  let userId = req.jwtUser.altId ? req.jwtUser.altId : req.jwtUser.id;
  if (!userId) {
    res.sendStatus(404);
  }
  try {
    logger.log({
      level: "info",
      message: `ROUTE: TV Discovery Profile returned for ${userId}`,
    });
    let data = await getDiscovery(userId, "show");
    if (data.error) throw data.error;
    res.json(data);
  } catch (err) {
    logger.log({ level: "error", message: err });
    res.sendStatus(500);
  }
});

export default router;
