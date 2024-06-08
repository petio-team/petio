import { Override } from '@/infrastructure/utils/override';

/**
 * Represents the gender of a person.
 */
export enum PersonGender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
  Unknown = 'Unknown',
}

/**
 * Represents the media type of a person.
 */
export enum PersonMediaType {
  Movie = 'Movie',
  Show = 'Show',
}

/**
 * Represents the properties of a Person.
 */
export type PersonProps = {
  name: string;
  gender: PersonGender;
  bio: string;
  role: string;
  birthDate: string;
  deathDate?: string;
  popularity: {
    tmdb: number;
  };
  artwork: {
    poster?: {
      url: string;
      source: string;
    };
  };
  media: {
    movies: {
      name: string;
      provider: {
        tmdbId: number;
      };
    }[];
    shows: {
      name: string;
      provider: {
        tmdbId: number;
      };
    }[];
  };
  provider: {
    tmdbId: number;
  };
  source: string;
};

/**
 * Represents the properties for creating a Person.
 */
export type CreatePersonProps = Override<
  PersonProps,
  {
    // TODO: add fields to override
  }
>;
