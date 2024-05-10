import { nanoid } from 'napi-nanoid';

import { BaseEntity } from '@/infrastructure/entity/entity';

import { CreateRequestProps, RequestProps } from './types';

/**
 * Represents a Request entity.
 */
export class RequestEntity extends BaseEntity<RequestProps> {
  /**
   * Creates a new Request entity.
   * @param create - The properties to create the Request entity.
   * @returns The newly created Request entity.
   */
  static create(create: CreateRequestProps): RequestEntity {
    const id = nanoid();
    const props: RequestProps = {
      ...create,
    };
    return new RequestEntity({ id, props });
  }

  /**
   * Gets the type of the entity.
   * @returns The type of the entity.
   */
  get type(): string {
    return this.props.type;
  }

  /**
   * Gets the title of the entity.
   * @returns The title of the entity.
   */
  get title(): string {
    return this.props.title;
  }

  /**
   * Gets the thumbnail of the entity.
   * @returns The thumbnail of the entity.
   */
  get thumbnail(): string {
    return this.props.thumbnail;
  }

  /**
   * Gets the imdbId of the entity.
   * @returns The imdbId of the entity.
   */
  get imdbId(): string {
    return this.props.imdbId;
  }

  /**
   * Gets the TMDB ID of the entity.
   * @returns The TMDB ID.
   */
  get tmdbId(): string {
    return this.props.tmdbId;
  }

  /**
   * Gets the TVDB ID of the entity.
   * @returns The TVDB ID.
   */
  get tvdbId(): string {
    return this.props.tvdbId;
  }

  /**
   * Gets the users of the entity.
   * @returns The users of the entity.
   */
  get users(): string[] {
    return this.props.users;
  }

  /**
   * Gets the Sonarr IDs of the entity.
   * @returns The Sonarr IDs of the entity.
   */
  get sonarrs(): string[] {
    return this.props.sonarrs;
  }

  /**
   * Gets the Radarr IDs of the entity.
   * @returns The Radarr IDs of the entity.
   */
  get radarrs(): string[] {
    return this.props.radarrs;
  }

  /**
   * Gets the approved status of the entity.
   * @returns The approved status of the entity.
   */
  get approved(): boolean {
    return this.props.approved;
  }

  /**
   * Gets the manual status of the entity.
   * @returns The manual status of the entity.
   */
  get status(): number {
    return this.props.status;
  }

  /**
   * Gets the pending status of the entity.
   * @returns The pending status of the entity.
   */
  get pending(): Record<string, unknown> {
    return this.props.pending;
  }

  /**
   * Gets the seasons of the entity.
   * @returns The seasons of the entity.
   */
  get seasons(): Record<number, boolean> {
    return this.props.seasons;
  }

  /**
   * Gets the timestamp of the entity.
   * @returns The timestamp of the entity.
   */
  get timestamp(): Date {
    return this.timestamp;
  }

  /**
   * Validates the Request entity.
   */
  public validate(): void {}
}
