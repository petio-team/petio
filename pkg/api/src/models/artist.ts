import mongoose from 'mongoose';

const MusicSchema = new mongoose.Schema(
  {
    title: String,
    ratingKey: Number,
    metaId: String,
    metaTitle: String,
    key: String,
    guid: String,
    type: String,
    summary: String,
    index: Number,
    thumb: String,
    addedAt: Number,
    updatedAt: Number,
    Genre: Array,
    Country: Array,
  },
  { collection: 'music' },
);

export default mongoose.model('Music', MusicSchema);

// ratingKey
