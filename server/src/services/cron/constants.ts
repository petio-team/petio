import { CronOptions } from './types';

/**
 * Default cron options.
 */
export const DefaultCronOptions: CronOptions = {
  lockLimit: 1,
  lockLifetime: 1000 * 60 * 10,
  priority: 0,
  concurrency: 1,
};
