import { Router } from "express";

import logger from "@/loaders/logger";
import { adminRequired } from "../middleware/auth";
import Filter from "@/models/filter";

const route = Router();

export default (app: Router) => {
  app.use("/filter", route);
  route.use(adminRequired);

  route.post("/update", async (req, res) => {
    let movie_filter = req.body.movie;
    let tv_filter = req.body.tv;
    let existingMovie = await Filter.findOne({ id: "movie_filters" });
    let existingTv = await Filter.findOne({ id: "tv_filters" });
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

  route.get("/", async (_req, res) => {
    try {
      let data = await Filter.find();
      res.json(data);
    } catch {
      logger.warn("FILTER: Unable to load filters");
      res.json({});
    }
  });
};
