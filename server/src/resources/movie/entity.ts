import mongoose from 'mongoose';

import { BaseEntity } from '@/infrastructure/entity/entity';

import { CreateMovieProps, MovieProps, MovieProviders } from './types';

/**
 * Represents a Movie entity.
 */
export class MovieEntity extends BaseEntity<MovieProps> {
  /**
   * Creates a new Movie entity.
   * @param create - The properties to create the Movie entity.
   * @returns The newly created Movie entity.
   */
  static create(create: CreateMovieProps): MovieEntity {
    const id = new mongoose.Types.ObjectId().toString();
    const props: MovieProps = {
      ...create,
    };
    return new MovieEntity({ id, props });
  }

  /**
   * Gets the title of the movie.
   * @returns The title of the movie.
   */
  get title(): string {
    return this.props.title;
  }

  /**
   * Gets the description of the movie.
   * @returns The description of the movie.
   */
  get description(): string {
    return this.props.description;
  }

  /**
   * Gets the certification of the movie.
   * @returns The certification of the movie.
   */
  get certification(): string | undefined {
    return this.props.certification;
  }

  /**
   * Gets the tagline of the movie.
   * @returns The tagline of the movie.
   */
  get tagline(): string {
    return this.props.tagline;
  }

  /**
   * Gets the duration of the movie.
   * @returns The duration of the movie.
   */
  get duration(): number {
    return this.props.duration;
  }

  /**
   * Gets the release date of the movie.
   * @returns The release date of the movie.
   */
  get releaseDate(): Date {
    return this.props.releaseDate;
  }

  /**
   * Gets the release status of the movie.
   * @returns The release status of the movie.
   */
  get releaseStatus(): string | undefined {
    return this.props.releaseStatus;
  }

  /**
   * Gets the budget of the movie.
   * @returns The budget of the movie.
   */
  get budget(): number | undefined {
    return this.props.budget;
  }

  /**
   * Gets the revenue of the movie.
   * @returns The revenue of the movie.
   */
  get revenue(): number | undefined {
    return this.props.revenue;
  }

  /**
   * Gets the rating of the movie.
   * @returns The rating of the movie.
   */
  get rating(): {
    plex?: number;
    imdb?: number;
    tmdb?: number;
  } {
    return this.props.rating;
  }

  /**
   * Gets the language of the movie.
   * @returns The language of the movie.
   */
  get language():
    | {
        spoken: string[];
        original: string;
      }
    | undefined {
    return this.props.language;
  }

  /**
   * Gets the artwork of the movie.
   * @returns The artwork of the movie.
   */
  get artwork(): {
    logo?: string;
    thumbnail?: string;
    poster?: string;
    banner?: string;
    background?: string;
  } {
    return this.props.artwork;
  }

  /**
   * Gets the studios of the movie.
   * @returns The studios of the movie.
   */
  get studios(): {
    name: string;
    logoPath: string;
    providers?: MovieProviders;
  }[] {
    return this.props.studios;
  }

  /**
   * Gets the roles of the movie.
   * @returns The roles of the movie.
   */
  get roles():
    | {
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
      }
    | undefined {
    return this.props.roles;
  }

  /**
   * Gets the resources of the movie.
   * @returns The resources of the movie.
   */
  get resources():
    | {
        resolution: string;
        path: string;
        providers?: MovieProviders;
      }[]
    | undefined {
    return this.props.resources;
  }

  /**
   * Gets the countries of the movie.
   * @returns The countries of the movie.
   */
  get countries():
    | {
        name: string;
        code: string;
      }[]
    | undefined {
    return this.props.countries;
  }

  /**
   * Gets the keywords of the movie.
   * @returns The keywords of the movie.
   */
  get keywords():
    | {
        name: string;
        providers?: MovieProviders;
      }[]
    | undefined {
    return this.props.keywords;
  }

  /**
   * Gets the genres of the movie.
   * @returns The genres of the movie.
   */
  get genres():
    | {
        name: string;
        providers?: MovieProviders;
      }[]
    | undefined {
    return this.props.genres;
  }

  /**
   * Gets the videos associated with the movie.
   * @returns An array of trailers, each containing a key.
   */
  get videos():
    | {
        trailers: {
          key: string;
        }[];
      }
    | undefined {
    return this.props.videos;
  }

  /**
   * Gets the collections associated with the movie.
   * @returns An array of collections, each containing a name and an array of movies.
   */
  get collections():
    | {
        name: string;
        movies: {
          name: string;
          posterUrl: string;
          providers?: MovieProviders;
        }[];
        providers: MovieProviders;
      }
    | undefined {
    return this.props.collections;
  }

  /**
   * Gets the similar movies for this movie.
   * @returns An array of objects representing similar movies, each containing the title, poster URL, and optional providers.
   */
  get similars():
    | {
        title: string;
        posterUrl: string;
        providers?: MovieProviders;
      }[]
    | undefined {
    return this.props.similars;
  }

  /**
   * Gets the recommendations for the movie.
   * @returns An array of movie recommendations, each containing the title, poster URL, and optional providers.
   */
  get recommendations():
    | {
        title: string;
        posterUrl: string;
        providers?: MovieProviders;
      }[]
    | undefined {
    return this.props.recommendations;
  }

  /**
   * Gets the providers of the movie.
   * @returns The movie providers.
   */
  get providers(): MovieProviders {
    return this.props.providers;
  }

  /**
   * Gets the source of the movie.
   * @returns The source of the movie.
   */
  get source(): string {
    return this.props.source;
  }

  /**
   * Validates the Movie entity.
   */
  public validate(): void {}
}
