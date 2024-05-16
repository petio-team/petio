import {
  FilterActionProps,
  FilterConditionProps,
} from '@/resources/filter/types';

export type UpdateFilterProps = {
  filters: FilterConditionProps[];
  actions: FilterActionProps[];
  collapse: boolean;
};
