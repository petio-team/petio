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
    if (existingMovie) {
      await Filter.findOneAndUpdate(
        { id: "movie_filters" },
        {
          $set: {
            data: movie_filter,
          },
        },
        { useFindAndModify: false }
      );
      logger.verbose("FILTER: Movie Filter updated");
    } else {
      let newMovie = new Filter({
        id: "movie_filters",
        data: movie_filter,
      });
      await newMovie.save();
      logger.verbose("FILTER: New Movie filter created");
    }
    if (existingTv) {
      await Filter.findOneAndUpdate(
        { id: "tv_filters" },
        {
          $set: {
            data: tv_filter,
          },
        },
        { useFindAndModify: false }
      );
      logger.verbose("FILTER: TV Filter updated");
    } else {
      let newTv = new Filter({
        id: "tv_filters",
        data: tv_filter,
      });
      await newTv.save();
      logger.verbose("FILTER: New TV filter created");
    }
    logger.info("FILTER: Filters updated");
    res.sendStatus(200);
  } catch (err) {
    logger.error("FILTER: Error saving filters");
    logger.log({ level: "error", message: err });
    res.sendStatus(500);
  }
});

router.get("/", async (req, res) => {
  try {
    let data = await Filter.find();
    res.json(data);
  } catch {
    logger.warn("FILTER: Unable to load filters");
    res.json({});
  }
});

module.exports = router;
