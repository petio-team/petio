import express from "express";

import search from "../tmdb/search";
import MusicMeta from "../meta/musicBrainz";
import logger from "../app/logger";

const router = express.Router();

router.get("/:term", async (req, res) => {
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

router.get("/music/:term", async (req, res) => {
  new MusicMeta().search(req.params.term);
});

export default router;
