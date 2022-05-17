import express from "express";

import getSessions from "../plex/sessions";
import logger from "../app/logger";
import { adminRequired } from "../middleware/auth";

const router = express.Router();
router.use(adminRequired);
router.get("/", async (_, res) => {
  try {
    let data = await getSessions();
    res.json(data.MediaContainer);
  } catch (err) {
    logger.log("warn", "ROUTE: Unable to get sessions");
    logger.log({ level: "error", message: err });
    res.status(500).send();
  }
});

export default router;
