import mongoose from "mongoose";

const ImdbSchema = mongoose.Schema({
  id: String,
  rating: String,
});

export default mongoose.model("Imdb", ImdbSchema);
