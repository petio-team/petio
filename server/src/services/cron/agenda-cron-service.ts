import { Agenda } from '@hokify/agenda';
import Bluebird from 'bluebird';
import { Service } from 'diod';

import { ContainerTags } from '@/infrastructure/container/constants';
import {
  findTaggedServiceIdentifiers,
  getFromContainer,
} from '@/infrastructure/container/container';
import { Logger } from '@/infrastructure/logger/logger';
import { Jobber } from '@/services/cron/job';

import { CronService } from './cron-service';
import { CronJobProcessor, CronOptions, JobCronName } from './types';

/**
 * Represents a service for managing cron jobs using the Agenda library.
 */
@Service()
export class AgendaCronService extends CronService {
  constructor(
    activeJobs: JobCronName[],
    private agenda: Agenda,
    logger: Logger,
  ) {
    super(activeJobs, logger.child({ module: 'services.cron.agenda' }));
  }

  /**
   * Adds a new cron job to the Agenda scheduler.
   * @param jobName - The name of the job.
   * @param processor - The function that will be executed when the job runs.
   * @param interval - The cron interval at which the job should run.
   * @param options - Additional options for the cron job.
   */
  protected async addJob<TData>(
    jobName: JobCronName,
    processor: CronJobProcessor<TData>,
    interval: string,
    options: CronOptions,
  ) {
    this.agenda.define(
      jobName,
      async (job: any) => {
        await processor({
          name: jobName,
          data: job.attrs.data as TData,
        });
      },
      {
        lockLifetime: options.lockLifetime,
        lockLimit: options.lockLimit,
        concurrency: options.concurrency,
        priority: options.priority,
      },
    );

    await this.agenda.every(interval, jobName);
  }

  /**
   * Registers the cron jobs by finding the tagged service identifiers and
   * calling the `register` method on each job.
   * @returns A promise that resolves when all jobs have been registered.
   */
  async registerJobs(): Promise<void> {
    const jobIdentifiers = findTaggedServiceIdentifiers(
      ContainerTags.AGENDA_CRON_JOB,
    );
    await Bluebird.mapSeries(jobIdentifiers, async (identifier) => {
      const job = getFromContainer<Jobber>(identifier);
      await job.register();
    });
  }

  /**
   * Removes a cron job from the Agenda scheduler.
   * @param jobName - The name of the job to remove.
   */
  protected async removeJob(jobName: JobCronName) {
    await this.agenda.cancel({ name: jobName });
  }

  /**
   * Initializes the Agenda scheduler.
   */
  protected async initialise() {
    await this.registerJobs();
    await this.agenda.start();
  }

  /**
   * Shuts down the Agenda scheduler.
   */
  protected async shutdown() {
    await this.agenda.stop();
  }
}
