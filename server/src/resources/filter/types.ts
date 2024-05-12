import { Override } from '@/infrastructure/utils/override';

/**
 * Represents the type of filter.
 */
export enum FilterType {
  MOVIE = 'movie',
  SHOW = 'show',
}

/**
 * Represents the properties of a FilterAction.
 */
export type FilterActionProps = {
  server: string;
  path: string;
  profile: string;
  language: string;
  tag: string;
  type?: string; // Standard/Daily/Anime
};

/**
 * Represents the properties of a FilterCondition.
 */
export type FilterConditionProps = {
  condition: string;
  operator: string;
  value: string;
  comparison: string;
};

/**
 * Represents the properties of a Filter.
 */
export type FilterProps = {
  type: FilterType;
  filters: FilterConditionProps[];
  actions: FilterActionProps[];
  collapse: boolean;
};

/**
 * Represents the properties for creating a Filter.
 */
export type CreateFilterProps = Override<
  FilterProps,
  {
    // TODO: add fields to override
  }
>;
