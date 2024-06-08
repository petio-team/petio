import { Override } from '@/infrastructure/utils/override';

/**
 * Represents the roles associated with a show.
 */
export type ShowRolesProps = {
  creators?: {
    name: string;
    thumbnail: string;
    providers: { tmdb: number };
  }[];
  executiveProducers?: {
    name: string;
    thumbnail: string;
    providers: { tmdb: number };
  }[];
  producers?: {
    name: string;
    thumbnail: string;
    providers: { tmdb: number };
  }[];
  directors?: {
    name: string;
    thumbnail: string;
    providers: { tmdb: number };
  }[];
  authors?: {
    name: string;
    thumbnail: string;
    providers: { tmdb: number };
  }[];
  writers?: {
    name: string;
    thumbnail: string;
    providers: { tmdb: number };
  }[];
  actors?: {
    name: string;
    character: string;
    thumbnail: string;
    providers: { tmdb: number };
  }[];
};

/**
 * Represents the properties of a show season.
 */
export type ShowSeasonProps = {
  name: string;
  index: number;
  rating?: number;
  description?: string;
  posterPath?: string;
  bannerPath?: string;
  episodes: {
    index: number;
    name: string;
    description?: string;
    airDate?: string;
    rating?: number;
    runtime?: number;
    stillPath?: string;
    resources?: {
      resolution: string;
      path?: string;
    }[];
  }[];
  providers?: {
    plex?: number;
  };
};

/**
 * Represents the properties of a Show.
 */
export type ShowProps = {
  title: string;
  description: string;
  tagline?: string;
  certification?: string;
  duration: number;
  type?: string;
  status?: string;
  firstAirDate?: Date;
  finalAirDate?: Date;
  rating: {
    tmdb?: number;
  };
  language?: {
    spoken: string[];
    original: string;
  };
  artwork: {
    logo?: string;
    thumbnail?: string;
    poster?: string;
    banner?: string;
    background?: string;
  };
  networks?: {
    name: string;
    logoPath?: string;
    provider?: {
      tmdb: number;
    };
  }[];
  totalSeasons?: number;
  totalEpisodes?: number;
  seasons: ShowSeasonProps[];
  roles?: ShowRolesProps;
  countries?: {
    name: string;
    code: string;
  }[];
  keywords?: {
    name: string;
    providers?: {
      tmdb: number;
    };
  }[];
  genres?: {
    name: string;
    providers?: {
      tmdb: number;
    };
  }[];
  videos?: {
    trailers: {
      key: string;
    }[];
  };
  similars?: {
    title: string;
    posterUrl: string;
    providers: {
      tmdb: number;
    };
  }[];
  recommendations?: {
    title: string;
    posterUrl: string;
    providers: {
      tmdb: number;
    };
  }[];
  providers: {
    tvdb?: number;
    tmdb?: number;
    imdb?: string;
    tvrage?: number;
    plex?: number;
  };
  source: string;
};

/**
 * Represents the properties for creating a Show.
 */
export type CreateShowProps = Override<ShowProps, {}>;
