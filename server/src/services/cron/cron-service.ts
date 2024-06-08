import { Service } from 'diod';
import pino from 'pino';

import { DefaultCronOptions } from './constants';
import {
  CronJobData,
  CronJobProcessor,
  CronOptions,
  JobCronName,
} from './types';

/**
 * Represents a base class for a cron service.
 */
@Service()
export abstract class CronService {
  constructor(
    private activeJobs: JobCronName[],
    private logger: pino.Logger<string>,
  ) {}

  /**
   * Adds a job to the cron service.
   * @param jobName - The name of the job.
   * @param processor - The function that processes the job.
   * @param interval - The interval at which the job should run.
   * @param options - Additional options for the job.
   */
  protected abstract addJob<TData = unknown>(
    jobName: JobCronName,
    processor: CronJobProcessor<TData>,
    interval: string,
    options: CronOptions,
  ): Promise<void>;

  /**
   * Removes a job from the cron service.
   * @param jobName - The name of the job to remove.
   */
  protected abstract removeJob(jobName: JobCronName): Promise<void>;

  /**
   * Initializes the cron service.
   */
  protected abstract initialise(): Promise<void>;

  /**
   * Shuts down the cron service.
   */
  protected abstract shutdown(): Promise<void>;

  /**
   * Boots up the cron service.
   */
  async bootstrap(): Promise<void> {
    if (!this.activeJobs || !this.activeJobs.length) {
      this.logger.trace('No active jobs found');
    } else {
      this.logger.trace(
        'Found following active jobs:',
        this.activeJobs.join(', '),
      );
    }

    try {
      await this.initialise();
      this.logger.debug('Cron service initialised');
    } catch (err) {
      this.logger.error(err, 'Failed to initialise cron service');
    }
  }

  /**
   * Terminates the cron service.
   */
  async terminate(): Promise<void> {
    try {
      await this.shutdown();
    } catch (err) {
      this.logger.error(err, 'Failed to terminate cron service');
    }
  }

  /**
   * Checks if a job with the specified name is active.
   * @param jobName - The name of the job to check.
   * @returns A boolean indicating whether the job is active or not.
   */
  private isActiveJob(jobName: JobCronName): boolean {
    return this.activeJobs.includes(jobName);
  }

  /**
   * Adds a job to the cron service.
   * @param jobName - The name of the job.
   * @param processor - The function that processes the job.
   * @param interval - The interval at which the job should run.
   * @param options - Additional options for the job.
   */
  async add<TData = unknown>(
    jobName: JobCronName,
    processor: (job: CronJobData<TData>) => Promise<void>,
    interval: string,
    options: CronOptions,
  ): Promise<void> {
    if (!this.isActiveJob(jobName)) {
      this.logger.trace(`Job '${jobName}' is not active`);
      return;
    }

    const mergedOptions = {
      ...DefaultCronOptions,
      ...options,
    };

    // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
    const _this = this;
    try {
      await this.addJob(
        jobName,
        async (job) => {
          try {
            const startedAt = new Date();
            await processor({
              name: jobName,
              data: job.data as TData,
            });
            const finishedAt = new Date();
            _this.logger.info(
              `Job '${jobName}' processed in ${
                finishedAt.getTime() - startedAt.getTime()
              }ms`,
            );
          } catch (err) {
            _this.logger.error(err, `Failed to process job '${jobName}'`);
          }
        },
        interval,
        mergedOptions,
      );
      this.logger.debug(`Job '${jobName}' added`);
    } catch (err) {
      this.logger.error(err, `Failed to add job '${jobName}'`);
    }
  }

  /**
   * Removes a job from the cron service.
   * @param jobName - The name of the job to remove.
   */
  async remove(jobName: JobCronName): Promise<void> {
    if (!this.isActiveJob(jobName)) {
      this.logger.trace(`Job '${jobName}' is not active`);
      return;
    }

    try {
      await this.removeJob(jobName);
      this.logger.info(`Job '${jobName}' removed`);
    } catch (err) {
      this.logger.error(err, `Failed to remove job '${jobName}'`);
    }
  }
}
