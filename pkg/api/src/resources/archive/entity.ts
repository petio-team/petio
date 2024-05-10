import { nanoid } from 'napi-nanoid';

import { BaseEntity } from '@/infrastructure/entity/entity';

import { ArchiveProps, CreateArchiveProps } from './types';

/**
 * Represents a Archive entity.
 */
export class ArchiveEntity extends BaseEntity<ArchiveProps> {
  /**
   * Creates a new Archive entity.
   * @param create - The properties to create the Archive entity.
   * @returns The newly created Archive entity.
   */
  static create(create: CreateArchiveProps): ArchiveEntity {
    const id = nanoid();
    const props: ArchiveProps = {
      ...create,
    };
    return new ArchiveEntity({ id, props });
  }

  /**
   * Validates the Archive entity.
   */
  public validate(): void {}
}
