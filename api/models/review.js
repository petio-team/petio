const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema(
  {
    tmdb_id: String,
    score: Number,
    comment: String,
    user: String,
    date: Date,
    type: String,
    title: String,
  },
  { collection: "reviews" }
);

module.exports = mongoose.model("Review", ReviewSchema);

// ratingKey
