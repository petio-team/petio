/**
 * Represents the response object for a movie.
 */
export type MovieResponseProps = {
  id: string;
  title: string;
  tagline: string;
  overview: string;
  backdrop_path: string;
  status?: string;
  budget?: number;
  revenue?: number;
  vote_average?: number;
  release_date?: string;
  runtime?: number;
  original_language?: string;
  original_language_format?: string;
  age_rating?: string;
  logo?: string;
  poster_path?: string;
  imdb_id?: string;
  tmdb_id?: string;
  belongs_to_collection?: {
    name: string;
  };
  collection?: Array<{
    id: string;
    name: string;
    poster_path: string;
  }>;
  recommendations?: Array<{
    id: string;
    title: string;
    poster_path: string;
  }>;
  on_server?:
    | {
        serverKey: string;
        versions: Array<{
          ratingKey: number;
          resolution: string;
        }>;
      }
    | boolean;
  available_resolutions?: string[];
  imdb_data?: {
    rating: {
      ratingValue: number;
    };
  };
  spoken_languages?: Array<{
    name: string;
  }>;
  production_companies?: Array<{
    id: number;
    name: string;
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
    id: number;
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
