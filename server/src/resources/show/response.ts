/**
 * Represents the response object for a show.
 */
export type ShowResponseProps = {
  id: string;
  name: string;
  type: string;
  tagline: string;
  overview: string;
  backdrop_path: string;
  poster_path?: string;
  original_language?: string;
  status: string;
  age_rating?: string;
  first_air_date?: string;
  last_air_date?: string;
  vote_average?: number;
  episode_run_time?: Array<number>;
  number_of_episodes: number;
  number_of_seasons: number;
  logo: string;
  tile: string;
  original_language_format: string;
  imdb_id: string;
  tmdb_id: string;
  seasons: Array<{
    name: string;
    season_number: number;
  }>;
  seasonData: Array<{
    season_number: number;
    name: string;
    episodes: Array<{
      episode_number: number;
      air_date: string;
      overview: string;
      still_path: string;
    }>;
  }>;
  recommendations?: Array<{
    id: number;
    title: string;
    poster_path: string;
  }>;
  on_server?: {
    serverKey: string;
    versions: Array<{
      ratingKey: number;
      resolution: string;
    }>;
  };
  imdb_data?: {
    rating: {
      ratingValue: number;
    };
  };
  spoken_languages?: Array<{
    name: string;
  }>;
  networks: Array<{
    id: number;
    name: string;
  }>;
  created_by: Array<{
    id: number;
    name: string;
    profile_path: string;
  }>;
  credits?: {
    cast: Array<{
      character: string;
      name: string;
      profile_path: string;
    }>;
    crew: Array<{
      job: string;
      name: string;
      profile_path: string;
    }>;
  };
  genres?: Array<{
    id: string;
  }>;
  keywords?: Array<{
    id: string;
  }>;
  videos?: {
    results: Array<{
      key: string;
    }>;
  };
};
