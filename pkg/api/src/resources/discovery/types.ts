import { Override } from '@/infra/utils/override';

/**
 * Represents the properties of a discovery genre.
 */
export type DiscoveryGenresProps = {
  count: number;
  name: string;
  cert: {
    [key: string]: number;
  };
  lowestRating: number;
  highestRating: number;
};

/**
 * Represents the properties of a discovery group.
 */
export type DiscoveryGroupProps = {
  genres: {
    [key: string]: DiscoveryGenresProps;
  };
  people: {
    cast: {
      [key: string]: number;
    };
    director: {
      [key: string]: number;
    };
  };
  history: {
    [key: string]: string;
  };
};

/**
 * Represents the properties of a Discovery.
 */
export type DiscoveryProps = {
  movie: DiscoveryGroupProps;
  series: DiscoveryGroupProps;
};

/**
 * Represents the properties for creating a Discovery.
 */
export type CreateDiscoveryProps = Override<
  DiscoveryProps,
  {
    // TODO: add fields to override
  }
>;
