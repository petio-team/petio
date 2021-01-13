const mongoose = require("mongoose");

const IssueSchema = mongoose.Schema({
  mediaId: String,
  type: String,
  title: String,
  user: String,
  sonarrId: Array,
  radarrId: Array,
  issue: String,
  comment: String,
});

module.exports = mongoose.model("Issue", IssueSchema);
