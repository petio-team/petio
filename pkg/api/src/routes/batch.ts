import express from "express";
import { movieLookup } from "../tmdb/movie";
import { showLookup } from "../tmdb/show";

const router = express.Router();

router.post("/movie", async (req, res) => {
  const ids = req.body.ids;
  const min = req.body.min === undefined ? true : req.body.min;
  let output = await Promise.all(
    ids.map(async (id) => {
      if (!id) return;
      const movie = await movieLookup(id, min);
      return movie;
    })
  );
  res.json(output);
});

router.post("/tv", async (req, res) => {
  const ids = req.body.ids;
  const min = req.body.min === undefined ? true : req.body.min;
  let output = await Promise.all(
    ids.map(async (id) => {
      if (!id) return;
      const movie = await showLookup(id, min);
      return movie;
    })
  );
  res.json(output);
});

export default router;