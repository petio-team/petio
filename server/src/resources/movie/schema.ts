import { Schema } from 'mongoose';

/**
 * Represents the properties of a Movie schema.
 */
export type MovieSchemaProps = {
  _id: string;
  title: string;
  ratingKey: number;
  key: string;
  guid: string;
  studio: string;
  type: string;
  titleSort: string;
  contentRating: string;
  summary: string;
  index: number;
  rating: number;
  year: number;
  tagline: string;
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
  primaryExtraKey: string;
  ratingImage: string;
  Media: {
    ratingKey: number;
    videoResolution: string;
  }[];
  Genre: {
    id: number;
    filter: string;
    tag: string;
  }[];
  Director: {
    id?: number;
    filter?: string;
    tag?: string;
    tagKey?: string;
    thumb?: string;
  }[];
  Writer: {
    id?: number;
    filter?: string;
    tag?: string;
    tagKey?: string;
    thumb?: string;
  }[];
  Country: {
    id?: number;
    filter?: string;
    tag?: string;
  }[];
  Role: {
    id?: number;
    filter?: string;
    tag?: string;
    tagKey?: string;
    role?: string;
    thumb?: string;
  }[];
  idSource: string;
  externalId: string;
  imdb_id: string;
  tmdb_id: string;
  petioTimestamp: Date;
};

/**
 * Represents the Movie schema.
 */
export const MovieSchema = new Schema<MovieSchemaProps>({
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
  tagline: { type: String, required: true },
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
  primaryExtraKey: { type: String, required: true },
  ratingImage: { type: String, required: true },
  Media: { type: [Object], required: true },
  Genre: { type: [Object], required: true },
  Director: { type: [Object], required: true },
  Writer: { type: [Object], required: true },
  Country: { type: [Object], required: true },
  Role: { type: [Object], required: true },
  idSource: { type: String, required: true },
  externalId: { type: String, required: true },
  imdb_id: { type: String, required: true },
  tmdb_id: { type: String, required: true },
  petioTimestamp: { type: Date, required: true },
});
