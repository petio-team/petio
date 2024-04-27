import mongoose from 'mongoose';

export type Show = mongoose.Document & {
  ratingKey: number;
  key: string;
  guid: string;
  studio: string;
  type: string;
  title: string;
  titleSort: string;
  contentRating: string;
  summary: string;
  index: number;
  rating: number;
  year: number;
  thumb: string;
  art: string;
  banner: string;
  theme: string;
  duration: number;
  originallyAvailableAt: string;
  leafCount: number;
  viewedLeafCount: number;
  childCount: number;
  addedAt: number;
  updatedAt: number;
  Genre: any[];
  idSource: string;
  externalId: string;
  tvdb_id: string;
  imdb_id: string;
  tmdb_id: string;
  petioTimestamp: Date;
  seasonData: object;
};

const TvSchema = new mongoose.Schema({
  ratingKey: Number,
  key: String,
  guid: String,
  studio: String,
  type: String,
  title: String,
  titleSort: String,
  contentRating: String,
  summary: String,
  index: Number,
  rating: Number,
  year: Number,
  thumb: String,
  art: String,
  banner: String,
  theme: String,
  duration: Number,
  originallyAvailableAt: String,
  leafCount: Number,
  viewedLeafCount: Number,
  childCount: Number,
  addedAt: Number,
  updatedAt: Number,
  Genre: Array,
  idSource: String,
  externalId: String,
  tvdb_id: { type: String, index: true },
  imdb_id: { type: String, index: true },
  tmdb_id: { type: String, index: true },
  petioTimestamp: Date,
  seasonData: Object,
});

const ShowModel = mongoose.model<Show>('Show', TvSchema);
export default ShowModel;
