import { authRequired } from "@/api/middleware/auth";
import { Router } from "express";

import Review from "@/models/review";
import { UserModel } from "@/models/user";

const route = Router();

export default (app: Router) => {
  app.use("/review", route);
  route.use(authRequired);

  route.post("/add", async (req, res) => {
    let item = req.body.item;
    let review = req.body.review;
    let user = req.body.user;
    try {
      let userData = await UserModel.findOne({ id: user });
      if (!userData) {
        throw new Error("failed to get user data");
      }
      let existingReview = await Review.findOne({
        tmdb_id: item.id,
        user: userData.id,
      });
      let savedReview = false;
      if (existingReview) {
        existingReview.score = review.score;
        savedReview = await existingReview.save();
      } else {
        const newReview = new Review({
          tmdb_id: item.id,
          score: review.score,
          comment: review.comment,
          user: userData.id,
          date: new Date(),
          type: item.type,
          title: item.title,
        });

        savedReview = await newReview.save();
      }

      res.json(savedReview);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  });

  route.get("/all", async (_req, res) => {
    try {
      const reviews = await Review.find();
      res.json(reviews);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  });

  route.get("/all/:id", async (req, res) => {
    let id = req.params.id;
    if (!id) {
      res.status(500).json({ error: "ID required" });
      return;
    }
    try {
      const reviews = await Review.find({ tmdb_id: id });
      res.json(reviews);
    } catch (err) {
      res.status(500).json({});
    }
  });
};
