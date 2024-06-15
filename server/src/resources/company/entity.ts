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
   * Validates the Company entity.
   */
  public validate(): void {}
}
