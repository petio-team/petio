const mongoose = require("mongoose");

const ImdbSchema = mongoose.Schema({
  id: String,
  rating: String,
});

module.exports = mongoose.model("Imdb", ImdbSchema);
