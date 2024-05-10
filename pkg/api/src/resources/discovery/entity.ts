import { nanoid } from 'napi-nanoid';

import { BaseEntity } from '@/infrastructure/entity/entity';

import {
  CreateDiscoveryProps,
  DiscoveryGroupProps,
  DiscoveryProps,
} from './types';

/**
 * Represents a Discovery entity.
 */
export class DiscoveryEntity extends BaseEntity<DiscoveryProps> {
  /**
   * Creates a new Discovery entity.
   * @param create - The properties to create the Discovery entity.
   * @returns The newly created Discovery entity.
   */
  static create(create: CreateDiscoveryProps): DiscoveryEntity {
    const id = nanoid();
    const props: DiscoveryProps = {
      ...create,
    };
    return new DiscoveryEntity({ id, props });
  }

  /**
   * Gets the movie property of the entity.
   * @returns The movie property.
   */
  get movie(): DiscoveryGroupProps {
    return this.props.movie;
  }

  /**
   * Gets the series of the entity.
   * @returns The series of the entity.
   */
  get series(): DiscoveryGroupProps {
    return this.props.series;
  }

  /**
   * Validates the Discovery entity.
   */
  public validate(): void {}
}
