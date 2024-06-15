import { nanoid } from 'nanoid';

import { BaseEntity } from '@/infrastructure/entity/entity';

import { CreateNetworkProps, NetworkProps } from './types';

/**
 * Represents a Network entity.
 */
export class NetworkEntity extends BaseEntity<NetworkProps> {
  /**
   * Creates a new Network entity.
   * @param create - The properties to create the Network entity.
   * @returns The newly created Network entity.
   */
  static create(create: CreateNetworkProps): NetworkEntity {
    const id = nanoid();
    const props: NetworkProps = {
      ...create,
    };
    return new NetworkEntity({ id, props });
  }

  get artwork(): { logo?: { url: string; source: string } } {
    return this.props.artwork;
  }

  get name(): string {
    return this.props.name;
  }

  get providers(): { tmdbId: number } {
    return this.props.providers;
  }

  get source(): string {
    return this.props.source;
  }

  /**
   * Validates the Network entity.
   */
  public validate(): void {}
}
