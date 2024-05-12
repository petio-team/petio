import { Override } from '@/infrastructure/utils/override';

/**
 * Represents the properties of a Cache.
 */
export type CacheProps = {
  key: string;
  value: any;
  expires: Date;
};

/**
 * Represents the properties for creating a Cache.
 */
export type CreateCacheProps = Override<
  CacheProps,
  {
    // TODO: add fields to override
  }
>;
