import { Override } from '@/infra/utils/override';

/**
 * Represents the properties of a Imdb.
 */
export type ImdbProps = {
  rating: string;
};

/**
 * Represents the properties for creating a Imdb.
 */
export type CreateImdbProps = Override<
  ImdbProps,
  {
    // TODO: add fields to override
  }
>;
