import { Override } from '@/infrastructure/utils/override';

export type MetadataSources = 'tmdb' | 'imdb' | 'plex';

export type MovieMetadataProviders = {
  tmdb?: {
    id: number;
  };
  imdb?: {
    id: number;
  };
};

export type MovieServerProviders = {
  plex?: {
    id: number;
    clientId?: string;
  };
};

export type MovieProviders = MovieMetadataProviders & MovieServerProviders;

/**
 * Represents the properties of a Movie.
 */
export type MovieProps = {
  title: string;
  description: string;
  certification?: string;
  tagline: string;
  duration: number;
  releaseDate: Date;
  releaseStatus?: string;
  budget?: number;
  revenue?: number;
  rating: {
    imdb?: number;
    tmdb?: number;
    metacritic?: number;
    rottenTomatoes?: number;
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
  studios: {
    name: string;
    logoPath: string;
    providers?: MovieProviders;
  }[];
  roles?: {
    executiveProducers: {
      name: string;
      thumbnail: string;
      providers?: MovieProviders;
    }[];
    producers: {
      name: string;
      thumbnail: string;
      providers?: MovieProviders;
    }[];
    directors: {
      name: string;
      thumbnail: string;
      providers?: MovieProviders;
    }[];
    authors: {
      name: string;
      thumbnail: string;
      providers?: MovieProviders;
    }[];
    writers: {
      name: string;
      thumbnail: string;
      providers?: MovieProviders;
    }[];
    actors: {
      name: string;
      character: string;
      thumbnail: string;
      providers?: MovieProviders;
    }[];
  };
  resources?: {
    resolution: string;
    path: string;
    providers?: MovieServerProviders;
  }[];
  countries?: {
    name: string;
    code: string;
  }[];
  keywords?: {
    name: string;
    providers?: MovieProviders;
  }[];
  genres?: {
    name: string;
    providers?: MovieProviders;
  }[];
  videos?: {
    trailers: {
      key: string;
    }[];
  };
  collections?: {
    name: string;
    movies: {
      name: string;
      posterUrl: string;
      providers?: MovieProviders;
    }[];
    providers: MovieProviders;
  };
  similars?: {
    title: string;
    posterUrl: string;
    providers?: MovieProviders;
  }[];
  recommendations?: {
    title: string;
    posterUrl: string;
    providers?: MovieProviders;
  }[];
  providers: MovieProviders;
  source: MetadataSources;
};

/**
 * Represents the properties for creating a Movie.
 */
export type CreateMovieProps = Override<MovieProps, {}>;
