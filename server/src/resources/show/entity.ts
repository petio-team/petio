import mongoose from 'mongoose';

import { BaseEntity } from '@/infrastructure/entity/entity';

import {
  CreateShowProps,
  ShowProps,
  ShowRolesProps,
  ShowSeasonProps,
} from './types';

/**
 * Represents a Show entity.
 */
export class ShowEntity extends BaseEntity<ShowProps> {
  /**
   * Creates a new Show entity.
   * @param create - The properties to create the Show entity.
   * @returns The newly created Show entity.
   */
  static create(create: CreateShowProps): ShowEntity {
    const id = new mongoose.Types.ObjectId().toString();
    const props: ShowProps = {
      ...create,
    };
    return new ShowEntity({ id, props });
  }

  /**
   * Gets the title of the show.
   * @returns The title of the show.
   */
  get title(): string {
    return this.props.title;
  }

  /**
   * Gets the description of the show.
   * @returns The description of the show.
   */
  get description(): string {
    return this.props.description;
  }

  /**
   * Gets the tagline of the show.
   * @returns The tagline of the show.
   */
  get tagline(): string | undefined {
    return this.props.tagline;
  }

  /**
   * Gets the certification of the show.
   * @returns The certification of the show.
   */
  get certification(): string | undefined {
    return this.props.certification;
  }

  /**
   * Gets the duration of the show.
   * @returns The duration of the show.
   */
  get duration(): number {
    return this.props.duration;
  }

  /**
   * Gets the type of the show.
   * @returns The type of the show.
   */
  get type(): string | undefined {
    return this.props.type;
  }

  /**
   * Gets the status of the show.
   * @returns The status of the show.
   */
  get status(): string | undefined {
    return this.props.status;
  }

  /**
   * Gets the first air date of the show.
   * @returns The first air date of the show.
   */
  get firstAirDate(): Date | undefined {
    return this.props.firstAirDate;
  }

  /**
   * Gets the final air date of the show.
   * @returns The final air date of the show.
   */
  get finalAirDate(): Date | undefined {
    return this.props.finalAirDate;
  }

  /**
   * Gets the rating of the show.
   * @returns The rating of the show.
   */
  get rating(): { tmdb?: number } {
    return this.props.rating;
  }

  /**
   * Gets the language of the show.
   * @returns The language of the show.
   */
  get language(): { spoken: string[]; original: string } | undefined {
    return this.props.language;
  }

  /**
   * Gets the artwork of the show.
   * @returns The artwork of the show.
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
   * Gets the networks of the show.
   * @returns The networks of the show.
   */
  get networks():
    | {
        name: string;
        logoPath?: string;
        provider?: { tmdb: number };
      }[]
    | undefined {
    return this.props.networks;
  }

  /**
   * Gets the total seasons of the show.
   * @returns The total seasons of the show.
   */
  get totalSeasons(): number | undefined {
    return this.props.totalSeasons;
  }

  /**
   * Gets the total episodes of the show.
   * @returns The total episodes of the show.
   */
  get totalEpisodes(): number | undefined {
    return this.props.totalEpisodes;
  }

  /**
   * Gets the seasons of the show.
   * @returns The seasons of the show.
   */
  get seasons(): ShowSeasonProps[] {
    return this.props.seasons;
  }

  /**
   * Gets the roles of the show.
   * @returns The roles of the show.
   */
  get roles(): ShowRolesProps | undefined {
    return this.props.roles;
  }

  /**
   * Gets the countries of the show.
   * @returns The countries of the show.
   */
  get countries(): { name: string; code: string }[] | undefined {
    return this.props.countries;
  }

  /**
   * Gets the keywords of the show.
   * @returns The keywords of the show.
   */
  get keywords(): { name: string; providers?: { tmdb: number } }[] | undefined {
    return this.props.keywords;
  }

  /**
   * Gets the genres of the show.
   * @returns The genres of the show.
   */
  get genres(): { name: string; providers?: { tmdb: number } }[] | undefined {
    return this.props.genres;
  }

  /**
   * Gets the videos of the show.
   * @returns The videos of the show.
   */
  get videos():
    | {
        trailers: { key: string }[];
      }
    | undefined {
    return this.props.videos;
  }

  /**
   * Gets the recommendations of the show.
   * @returns The recommendations of the show.
   */
  get recommendations():
    | {
        title: string;
        posterUrl: string;
        providers: { tmdb: number };
      }[]
    | undefined {
    return this.props.recommendations;
  }

  /**
   * Gets the similars of the show.
   * @returns The similars of the show.
   */
  get similars():
    | {
        title: string;
        posterUrl: string;
        providers: { tmdb: number };
      }[]
    | undefined {
    return this.props.similars;
  }

  /**
   * Gets the providers of the show.
   * @returns The providers of the show.
   */
  get providers(): {
    tvdb?: number;
    tmdb?: number;
    imdb?: string;
    tvrage?: number;
    plex?: number;
  } {
    return this.props.providers;
  }

  /**
   * Gets the source of the show.
   * @returns The source of the show.
   */
  get source(): string {
    return this.props.source;
  }

  /**
   * Validates the Show entity.
   */
  public validate(): void {}
}
