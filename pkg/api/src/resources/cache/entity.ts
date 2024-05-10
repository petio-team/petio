import { nanoid } from 'napi-nanoid';

import { BaseEntity } from '@/infra/entity/entity';

import { CacheProps, CreateCacheProps } from './types';

/**
 * Represents a Cache entity.
 */
export class CacheEntity extends BaseEntity<CacheProps> {
  /**
   * Creates a new Cache entity.
   * @param create - The properties to create the Cache entity.
   * @returns The newly created Cache entity.
   */
  static create(create: CreateCacheProps): CacheEntity {
    const id = nanoid();
    const props: CacheProps = {
      ...create,
    };
    return new CacheEntity({ id, props });
  }

  /**
   * Gets the key property of the entity.
   * @returns The key property.
   */
  get key(): string {
    return this.props.key;
  }

  /**
   * Gets the value of the entity.
   * @returns The value of the entity.
   */
  get value(): any {
    return this.props.value;
  }

  /**
   * Gets the expires property of the entity.
   * @returns The expires property.
   */
  get expires(): Date {
    return this.props.expires;
  }

  /**
   * Validates the Cache entity.
   */
  public validate(): void {}
}
