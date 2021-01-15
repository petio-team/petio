const mongoose = require("mongoose");

const MovieSchema = mongoose.Schema({
  title: String,
  ratingKey: Number,
  key: String,
  guid: String,
  studio: String,
  type: String,
  titleSort: String,
  contentRating: String,
  summary: String,
  rating: Number,
  year: Number,
  tagline: String,
  thumb: String,
  art: String,
  duration: Number,
  originallyAvailableAt: String,
  addedAt: Number,
  updatedAt: Number,
  primaryExtraKey: String,
  ratingImage: String,
  Media: Array,
  Genre: Array,
  Director: Array,
  Writer: Array,
  Country: Array,
  Role: Array,
  idSource: String,
  externalId: String,
  imdb_id: String,
  tmdb_id: String,
});

module.exports = mongoose.model("Movie", MovieSchema);

// ratingKey
