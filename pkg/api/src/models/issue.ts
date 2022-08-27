import mongoose from 'mongoose';

const IssueSchema = new mongoose.Schema({
  mediaId: String,
  type: String,
  title: String,
  user: String,
  sonarrId: Array,
  radarrId: Array,
  issue: String,
  comment: String,
});

export default mongoose.model('Issue', IssueSchema);
