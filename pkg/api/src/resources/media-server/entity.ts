import { nanoid } from 'napi-nanoid';

import { BaseEntity } from '@/infrastructure/entity/entity';

import { CreateMediaServerProps, MediaServerProps } from './types';

/**
 * Represents a media server entity.
 */
export class MediaServerEntity extends BaseEntity<MediaServerProps> {
  /**
   * Creates a new MediaServerEntity based on the provided properties.
   * @param create - The properties used to create the MediaServerEntity.
   * @returns A new instance of MediaServerEntity.
   */
  static create(create: CreateMediaServerProps): MediaServerEntity {
    const id = nanoid();
    const props: MediaServerProps = {
      ...create,
      libraries: create.libraries || [],
      users: create.users || [],
    };
    return new MediaServerEntity({ id, props });
  }

  /**
   * Gets the name of the entity.
   * @returns The name of the entity.
   */
  get name(): string {
    return this.props.name;
  }

  /**
   * Gets the type of the entity.
   * @returns The type of the entity.
   */
  get type(): string {
    return this.props.type;
  }

  /**
   * Gets the url of the entity.
   * @returns The url of the entity.
   */
  get url(): string {
    return this.props.url;
  }

  /**
   * Gets the token of the entity.
   * @returns The token of the entity.
   */
  get token(): string {
    return this.props.token;
  }

  /**
   * Gets the libraries of the entity.
   * @returns The libraries of the entity.
   */
  get libraries(): string[] {
    return this.props.libraries;
  }

  /**
   * Gets the users of the entity.
   * @returns The users of the entity.
   */
  get users(): string[] {
    return this.props.users;
  }

  /**
   * Gets the metadata of the entity.
   * @returns The metadata of the entity.
   */
  get metadata(): Record<string, unknown> {
    return this.props.metadata;
  }

  /**
   * Gets the enabled status of the entity.
   * @returns The enabled status of the entity.
   */
  get enabled(): boolean {
    return this.props.enabled;
  }

  /**
   * Validates the media server entity.
   */
  public validate(): void {}
}
