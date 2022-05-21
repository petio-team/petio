import { Router } from "express";

import logger from "@/loaders/logger";
import search from "@/tmdb/search";
import MusicMeta from "@/meta/musicBrainz";
import { authRequired } from "@/api/middleware/auth";

const route = Router();

export default (app: Router) => {
  app.use("/search", route);
  route.use(authRequired);

  route.get("/:term", async (req, res) => {
    try {
      let data = await search(req.params.term.replace(/[^a-zA-Z0-9 ]/g, ""));
      res.json(data);
    } catch (err) {
      logger.error(err);
      res.json({
        movies: [],
        people: [],
        shows: [],
      });
    }
  });

  route.get("/music/:term", async (req, res) => {
    new MusicMeta().search(req.params.term);
  });
};
