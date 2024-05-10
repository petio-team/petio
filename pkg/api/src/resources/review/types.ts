import { Override } from '@/infra/utils/override';

export enum ReviewType {
  MOVIE = 'movie',
  TV = 'tv',
}

/**
 * Represents the properties of a Review.
 */
export type ReviewProps = {
  title: string;
  score: number;
  comment: string;
  user: string;
  date: Date;
  type: ReviewType;
  tmdbId: string;
};

/**
 * Represents the properties for creating a Review.
 */
export type CreateReviewProps = Override<
  ReviewProps,
  {
    // TODO: add fields to override
  }
>;
