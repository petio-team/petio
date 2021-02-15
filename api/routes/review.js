require("dotenv/config");

const express = require("express");
const router = express.Router();
const Review = require("../models/review");
const User = require("../models/user");
const Admin = require("../models/admin");

router.post("/add", async (req, res) => {
  let item = req.body.item;
  let review = req.body.review;
  let user = req.body.user;
  let userData = await User.findOne({ id: user });
  if (!userData) {
    userData = await Admin.findOne({ id: user });
  }

  try {
    const newReview = new Review({
      tmdb_id: item.id,
      score: review.score,
      comment: review.comment,
      user: userData.id,
      date: new Date(),
      type: item.type,
      title: item.title,
    });

    const savedReview = await newReview.save();
    res.json(savedReview);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.get("/all", async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.get("/all/:id", async (req, res) => {
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

module.exports = router;
