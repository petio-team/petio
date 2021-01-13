const mongoose = require("mongoose");

const IssueSchema = mongoose.Schema({
  mediaId: String,
  type: String,
  title: String,
  thumb: String,
  imdb_id: String,
  tmdb_id: String,
  tvdb_id: String,
  user: String,
  sonarrId: Array,
  radarrId: Array,
});

module.exports = mongoose.model("Issue", IssueSchema);
