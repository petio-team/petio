import { MovieDetailsResponse } from '@/infrastructure/generated/tmdb-api-client';

export type MovieLookupProviderResponse = MovieDetailsResponse & {
  belongs_to_collection?: {
    id: number;
    name: string;
    poster_path: string;
    backdrop_path: string;
  };
  credits?: {
    cast: Array<{
      adult: boolean;
      gender: number;
      id: number;
      known_for_department: string;
      name: string;
      original_name: string;
      popularity: number;
      profile_path?: string;
      cast_id: number;
      character: string;
      credit_id: string;
      order: number;
    }>;
    crew: Array<{
      adult: boolean;
      gender: number;
      id: number;
      known_for_department: string;
      name: string;
      original_name: string;
      popularity: number;
      profile_path?: string;
      credit_id: string;
      department: string;
      job: string;
    }>;
  };
  videos?: {
    results: Array<{
      iso_639_1: string;
      iso_3166_1: string;
      name: string;
      key: string;
      site: string;
      size: number;
      type: string;
      official: boolean;
      published_at: string;
      id: string;
    }>;
  };
  keywords?: {
    keywords: Array<{
      id: number;
      name: string;
    }>;
  };
  release_dates?: {
    results: Array<{
      iso_3166_1: string;
      release_dates: Array<{
        certification: string;
        descriptors: Array<string>;
        iso_639_1: string;
        note: string;
        release_date: string;
        type: number;
      }>;
    }>;
  };
  recommendations?: {
    page: number;
    results: Array<{
      backdrop_path: string;
      id: number;
      original_title: string;
      overview: string;
      poster_path: string;
      media_type: string;
      adult: boolean;
      title: string;
      original_language: string;
      genre_ids: Array<number>;
      popularity: number;
      release_date: string;
      video: boolean;
      vote_average: number;
      vote_count: number;
    }>;
    total_pages: number;
    total_results: number;
  };
  similar?: {
    page: number;
    results: Array<{
      adult: boolean;
      backdrop_path: string;
      genre_ids: Array<number>;
      id: number;
      original_language: string;
      original_title: string;
      overview: string;
      popularity: number;
      poster_path: string;
      release_date: string;
      title: string;
      video: boolean;
      vote_average: number;
      vote_count: number;
    }>;
    total_pages: number;
    total_results: number;
  };
  images?: {
    backdrops: Array<{
      aspect_ratio: number;
      height: number;
      iso_639_1?: string;
      file_path: string;
      vote_average: number;
      vote_count: number;
      width: number;
    }>;
    logos: Array<{
      aspect_ratio: number;
      height: number;
      iso_639_1: string;
      file_path: string;
      vote_average: number;
      vote_count: number;
      width: number;
    }>;
    posters: Array<{
      aspect_ratio: number;
      height: number;
      iso_639_1?: string;
      file_path: string;
      vote_average: number;
      vote_count: number;
      width: number;
    }>;
  };
};
