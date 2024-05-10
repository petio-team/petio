import { Override } from '@/infra/utils/override';

/**
 * Represents the properties of a Show.
 */
export type ShowProps = {
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
  Genre: any[];
  idSource: string;
  externalId: string;
  tvdb_id: string;
  imdb_id: string;
  tmdb_id: string;
  petioTimestamp: Date;
  seasonData: object;
};

/**
 * Represents the properties for creating a Show.
 */
export type CreateShowProps = Override<
  ShowProps,
  {
    // TODO: add fields to override
  }
>;
