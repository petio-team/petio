import express from "express";
const router = express.Router();
import getSessions from "../plex/sessions";
import logger from "../util/logger";
import {adminRequired} from "../middleware/auth";

router.use(adminRequired);
router.get("/", async (req, res) => {
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
