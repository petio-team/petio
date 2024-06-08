import { nanoid } from 'nanoid';

import { BaseEntity } from '@/infrastructure/entity/entity';

import { CompanyProps, CreateCompanyProps } from './types';

/**
 * Represents a Company entity.
 */
export class CompanyEntity extends BaseEntity<CompanyProps> {
  /**
   * Creates a new Company entity.
   * @param create - The properties to create the Company entity.
   * @returns The newly created Company entity.
   */
  static create(create: CreateCompanyProps): CompanyEntity {
    const id = nanoid();
    const props: CompanyProps = {
      ...create,
    };
    return new CompanyEntity({ id, props });
  }

  /**
   * Validates the Company entity.
   */
  public validate(): void {}
}
