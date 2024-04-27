import mongoose from 'mongoose';

export type Movie = mongoose.Document & {
  title: string;
  ratingKey: number;
  key: string;
  guid: string;
  studio: string;
  type: string;
  titleSort: string;
  contentRating: string;
  summary: string;
  rating: number;
  year: number;
  tagline: string;
  thumb: string;
  art: string;
  duration: number;
  originallyAvailableAt: string;
  addedAt: number;
  updatedAt: number;
  primaryExtraKey: string;
  ratingImage: string;
  Media: any[];
  Genre: any[];
  Director: any[];
  Writer: any[];
  Country: any[];
  Role: any[];
  idSource: string;
  externalId: string;
  imdb_id: string;
  tmdb_id: string;
  petioTimestamp: Date;
};

const MovieSchema = new mongoose.Schema({
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
  imdb_id: { type: String, index: true },
  tmdb_id: { type: String, index: true },
  petioTimestamp: Date,
});

const MovieModel = mongoose.model<Movie>('Movie', MovieSchema);
export default MovieModel;
