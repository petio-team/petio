const express = require("express");
const router = express.Router();
const search = require("../tmdb/search");

router.get("/:term", async (req, res) => {
  try {
    let data = await search(req.params.term.replace(/[^a-zA-Z ]/g, ""));
    res.json(data);
  } catch {
    res.json({
      movies: [],
      people: [],
      shows: [],
    });
  }
});

module.exports = router;
