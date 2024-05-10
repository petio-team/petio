import { nanoid } from 'napi-nanoid';

import { BaseEntity } from '@/infrastructure/entity/entity';

import { CreateDownloaderProps, DownloaderProps } from './types';

/**
 * Represents a Downloader entity.
 */
export class DownloaderEntity extends BaseEntity<DownloaderProps> {
  /**
   * Creates a new Downloader entity.
   * @param create - The properties to create the Downloader entity.
   * @returns The newly created Downloader entity.
   */
  static create(create: CreateDownloaderProps): DownloaderEntity {
    const id = nanoid();
    const props: DownloaderProps = {
      ...create,
    };
    return new DownloaderEntity({ id, props });
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
   * Validates the Downloader entity.
   */
  public validate(): void {}
}
