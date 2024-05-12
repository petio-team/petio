import { nanoid } from 'nanoid';

import { BaseEntity } from '@/infrastructure/entity/entity';

import { CreateShowProps, ShowProps } from './types';

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
    const id = nanoid();
    const props: ShowProps = {
      ...create,
    };
    return new ShowEntity({ id, props });
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

  get title(): string {
    return this.props.title;
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

  get index(): number {
    return this.props.index;
  }

  get rating(): number {
    return this.props.rating;
  }

  get year(): number {
    return this.props.year;
  }

  get thumb(): string {
    return this.props.thumb;
  }

  get art(): string {
    return this.props.art;
  }

  get banner(): string {
    return this.props.banner;
  }

  get theme(): string {
    return this.props.theme;
  }

  get duration(): number {
    return this.props.duration;
  }

  get originallyAvailableAt(): string {
    return this.props.originallyAvailableAt;
  }

  get leafCount(): number {
    return this.props.leafCount;
  }

  get viewedLeafCount(): number {
    return this.props.viewedLeafCount;
  }

  get childCount(): number {
    return this.props.childCount;
  }

  get addedAt(): number {
    return this.props.addedAt;
  }

  get Genre(): any[] {
    return this.props.Genre;
  }

  get idSource(): string {
    return this.props.idSource;
  }

  get externalId(): string {
    return this.props.externalId;
  }

  get tvdb_id(): string {
    return this.props.tvdb_id;
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

  get seasonData(): object {
    return this.props.seasonData;
  }

  /**
   * Validates the Show entity.
   */
  public validate(): void {}
}
