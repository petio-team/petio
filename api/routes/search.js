import express from "express";
const router = express.Router();
import search from "../tmdb/search";
import MusicMeta from "../meta/musicBrainz";
import ExpressCache from "express-cache-middleware";
import cacheManager from "cache-manager";

// Cache for 1 day
const cacheMiddleware = new ExpressCache(
  cacheManager.caching({
    store: "memory",
    max: 100,
    ttl: 86400,
  })
);

// Caching not applied needs setting up

router.get("/:term", async (req, res) => {
  try {
    let data = await search(req.params.term.replace(/[^a-zA-Z0-9 ]/g, ""));
    res.json(data);
  } catch (err) {
    console.log(err);
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
