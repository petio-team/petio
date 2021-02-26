const express = require("express");
const router = express.Router();
const logger = require("../util/logger");
const { adminRequired } = require("../middleware/auth");
const Filter = require("../models/filter");

router.use(adminRequired);

router.post("/update", async (req, res) => {
  let movie_filter = req.body.movie;
  let tv_filter = req.body.tv;
  let existingMovie = await Filter.findOne({ id: "movie_filter" });
  let existingTv = await Filter.findOne({ id: "tv_filter" });
  try {
    test;
    if (existingMovie) {
      await Filter.findByIdAndUpdate(
        { id: "movie_filter" },
        {
          $set: {
            data: movie_filter,
          },
        }
      );
      logger.verbose("FILTER: Movie Filter updated");
    } else {
      let newMovie = new Filter({
        id: "movie_filter",
        data: movie_filter,
      });
      await newMovie.save();
      logger.verbose("FILTER: New Movie filter created");
    }
    logger.info("FILTER: Filters updated");
    res.sendStatus(200);
  } catch (err) {
    logger.error("FILTER: Error saving filters");
    logger.error(err);
    res.sendStatus(500);
  }
});

module.exports = router;
