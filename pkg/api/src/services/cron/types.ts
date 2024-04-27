export enum JobCronName {
  FULL_LIBRARY_SCAN = 'FULL_LIBRARY_SCAN',
  PARTIAL_LIBRARY_SCAN = 'PARTIAL_LIBRARY_SCAN',
  DISCOVERY_SCAN = 'DISCOVERY_SCAN',
  USERS_SCAN = 'USERS_SCAN',
  QUOTA_RESET = 'QUOTA_RESET',
  TMDB_CACHE = 'TMDB_CACHE',
  IMDB_CACHE = 'IMDB_CACHE',
}

export type CronOptions = {
  lockLimit?: number;
  lockLifetime?: number;
  priority?: number;
  concurrency?: number;
};

export type CronJobData<TData> = {
  name: JobCronName;
  data: TData;
};

export type CronJobProcessor<TData> = (
  data: CronJobData<TData>,
) => Promise<void>;

export enum CronJobState {
  ACTIVE = 'active',
  FAILED = 'failed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
