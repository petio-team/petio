import express from "express";
const router = express.Router();
import logger from "../util/logger";
import {movieLookup} from "../tmdb/movie";
import showLookup from "../tmdb/show";

router.post("/movie", async (req, res) => {
  const ids = req.body.ids;
  let output = await Promise.all(
    ids.map(async (id) => {
      if (!id) return;
      const movie = await movieLookup(id, true);
      return movie;
    })
  );
  res.json(output);
});

export default router;
