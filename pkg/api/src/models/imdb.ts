import mongoose from "mongoose";

const ImdbSchema = new mongoose.Schema({
  id: String,
  rating: String,
});

export default mongoose.model("Imdb", ImdbSchema);
