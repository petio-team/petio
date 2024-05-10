import { Override } from '@/utils/override';

/**
 * Represents the properties of a Movie.
 */
export type MovieProps = {
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

/**
 * Represents the properties for creating a Movie.
 */
export type CreateMovieProps = Override<
  MovieProps,
  {
    Media?: any[];
    Genre?: any[];
    Director?: any[];
    Writer?: any[];
    Country?: any[];
    Role?: any[];
  }
>;
