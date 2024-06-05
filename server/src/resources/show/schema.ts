import { Schema } from 'mongoose';

/**
 * Represents the properties of a Show schema.
 */
export type ShowSchemaProps = {
  _id: string;
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
  Genre: {
    id: number;
    name: string;
  }[];
  idSource: string;
  externalId: string;
  tvdb_id: string;
  imdb_id: string;
  tmdb_id: string;
  petioTimestamp: Date;
  seasonData: {
    seasonNumber: number;
    title: string;
    episodes: {
      title: string;
      episodeNumber: number;
      resolution?: string;
      videoCodec?: string;
      audioCodec?: string;
    }[];
  }[];
};

/**
 * Represents the Show schema.
 */
export const ShowSchema = new Schema<ShowSchemaProps>({
  title: { type: String, required: true },
  ratingKey: { type: Number, required: true },
  key: { type: String, required: true },
  guid: { type: String, required: true },
  studio: { type: String, required: true },
  type: { type: String, required: true },
  titleSort: { type: String, required: true },
  contentRating: { type: String, required: true },
  summary: { type: String, required: true },
  index: { type: Number, required: true },
  rating: { type: Number, required: true },
  year: { type: Number, required: true },
  thumb: { type: String, required: true },
  art: { type: String, required: true },
  banner: { type: String, required: true },
  theme: { type: String, required: true },
  duration: { type: Number, required: true },
  originallyAvailableAt: { type: String, required: true },
  leafCount: { type: Number, required: true },
  viewedLeafCount: { type: Number, required: true },
  childCount: { type: Number, required: true },
  addedAt: { type: Number, required: true },
  updatedAt: { type: Number, required: true },
  Genre: { type: [Object], required: true },
  idSource: { type: String, required: true },
  externalId: { type: String, required: true },
  tvdb_id: { type: String, required: true },
  imdb_id: { type: String, required: true },
  tmdb_id: { type: String, required: true },
  petioTimestamp: { type: Date, required: true },
  seasonData: { type: [Object], required: true },
});
