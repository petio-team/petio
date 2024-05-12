import mongoose from 'mongoose';

import { BaseEntity } from '@/infrastructure/entity/entity';

import { CreateMovieProps, MovieProps } from './types';

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
      Media: create.Media || [],
      Genre: create.Genre || [],
      Director: create.Director || [],
      Writer: create.Writer || [],
      Country: create.Country || [],
      Role: create.Role || [],
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

  get ratingKey(): number {
    return this.props.ratingKey;
  }

  get key(): string {
    return this.props.key;
  }

  get guid(): string {
    return this.props.guid;
  }

  get studio(): string {
    return this.props.studio;
  }

  get type(): string {
    return this.props.type;
  }

  get titleSort(): string {
    return this.props.titleSort;
  }

  get contentRating(): string {
    return this.props.contentRating;
  }

  get summary(): string {
    return this.props.summary;
  }

  get tagline(): string {
    return this.props.tagline;
  }

  get originallyAvailableAt(): string {
    return this.props.originallyAvailableAt;
  }

  get primaryExtraKey(): string {
    return this.props.primaryExtraKey;
  }

  get ratingImage(): string {
    return this.props.ratingImage;
  }

  get Media(): any[] {
    return this.props.Media;
  }

  get Genre(): any[] {
    return this.props.Genre;
  }

  get Director(): any[] {
    return this.props.Director;
  }

  get Writer(): any[] {
    return this.props.Writer;
  }

  get Country(): any[] {
    return this.props.Country;
  }

  get Role(): any[] {
    return this.props.Role;
  }

  get idSource(): string {
    return this.props.idSource;
  }

  get externalId(): string {
    return this.props.externalId;
  }

  get imdb_id(): string {
    return this.props.imdb_id;
  }

  get tmdb_id(): string {
    return this.props.tmdb_id;
  }

  get petioTimestamp(): Date {
    return this.props.petioTimestamp;
  }

  /**
   * Gets the year of the movie.
   * @returns The year of the movie.
   */
  get year(): number {
    return this.props.year;
  }

  /**
   * Gets the rating of the movie.
   * @returns The rating of the movie.
   */
  get rating(): number {
    return this.props.rating;
  }

  /**
   * Gets the thumb of the movie.
   * @returns The thumb of the movie.
   */
  get thumb(): string {
    return this.props.thumb;
  }

  /**
   * Gets the art of the movie.
   * @returns The art of the movie.
   */
  get art(): string {
    return this.props.art;
  }

  /**
   * Gets the duration of the movie.
   * @returns The duration of the movie.
   */
  get duration(): number {
    return this.props.duration;
  }

  /**
   * Gets the addedAt of the movie.
   * @returns The addedAt of the movie.
   */
  get addedAt(): number {
    return this.props.addedAt;
  }

  /**
   * Validates the Movie entity.
   */
  public validate(): void {}
}
