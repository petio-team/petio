import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
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

export default mongoose.model("Review", ReviewSchema);
