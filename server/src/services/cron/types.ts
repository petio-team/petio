export enum JobCronName {
  CONTENT_SCAN = 'CONTENT_SCAN',
  LIBRARY_SCAN = 'LIBRARY_SCAN',
  USERS_SCAN = 'USERS_SCAN',
  FULL_LIBRARY_SCAN = 'FULL_LIBRARY_SCAN',
  PARTIAL_LIBRARY_SCAN = 'PARTIAL_LIBRARY_SCAN',
  DISCOVERY_SCAN = 'DISCOVERY_SCAN',
  QUOTA_RESET = 'QUOTA_RESET',
  RESOURCE_CACHE = 'RESOURCE_CACHE',
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
