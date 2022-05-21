import { Router } from "express";

import logger from "@/loaders/logger";
import getSessions from "@/plex/sessions";
import { adminRequired } from "@/api/middleware/auth";

const route = Router();

export default (app: Router) => {
  app.use("/sessions", route);
  route.use(adminRequired);
  route.get("/", async (_, res) => {
    try {
      let data = await getSessions();
      res.json(data.MediaContainer);
    } catch (err) {
      logger.log("warn", "ROUTE: Unable to get sessions");
      logger.log({ level: "error", message: err });
      res.status(500).send();
    }
  });
};
