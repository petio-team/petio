import { nanoid } from 'napi-nanoid';

import { BaseEntity } from '@/infrastructure/entity/entity';

import {
  CreateFilterProps,
  FilterActionProps,
  FilterConditionProps,
  FilterProps,
} from './types';

/**
 * Represents a Filter entity.
 */
export class FilterEntity extends BaseEntity<FilterProps> {
  /**
   * Creates a new Filter entity.
   * @param create - The properties to create the Filter entity.
   * @returns The newly created Filter entity.
   */
  static create(create: CreateFilterProps): FilterEntity {
    const id = nanoid();
    const props: FilterProps = {
      ...create,
    };
    return new FilterEntity({ id, props });
  }

  /**
   * Gets the type of the entity.
   * @returns The type of the entity.
   */
  get type(): string {
    return this.props.type;
  }

  /**
   * Gets the filters for the entity.
   *
   * @returns An array of `FilterConditionProps` representing the filters.
   */
  get filters(): FilterConditionProps[] {
    return this.props.filters;
  }

  /**
   * Gets the actions for the entity.
   *
   * @returns The `FilterActionProps` representing the action.
   */
  get actions(): FilterActionProps[] {
    return this.props.actions;
  }

  /**
   * Gets the collapse property for the entity.
   *
   * @returns The collapse property.
   */
  get collapse(): boolean {
    return this.props.collapse;
  }

  /**
   * Validates the Filter entity.
   */
  public validate(): void {}
}
