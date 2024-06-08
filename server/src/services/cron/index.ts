import { Agenda } from '@hokify/agenda';
import Bluebird from 'bluebird';
import { ContainerBuilder } from 'diod';

import { DATABASE_URL } from '@/infrastructure/config/env';
import { ContainerTags } from '@/infrastructure/container/constants';
import {
  findTaggedServiceIdentifiers,
  getFromContainer,
} from '@/infrastructure/container/container';
import { Logger } from '@/infrastructure/logger/logger';
import { Jobber } from '@/services/cron/job';
import { ContentScanJob } from '@/services/cron/jobs/content-scan';
import { LibraryScanJob } from '@/services/cron/jobs/library-scan';
import { QuotaResetJob } from '@/services/cron/jobs/quota-reset';
import { ResourceCacheJob } from '@/services/cron/jobs/resource-cache';
import { UsersScanJob } from '@/services/cron/jobs/users-scan';

import { AgendaCronService } from './agenda-cron';
import { JobCronName } from './types';

export default (builder: ContainerBuilder) => {
  builder
    .registerAndUse(LibraryScanJob)
    .asSingleton()
    .addTag(ContainerTags.CRON_JOB);
  builder
    .registerAndUse(ContentScanJob)
    .asSingleton()
    .addTag(ContainerTags.CRON_JOB);
  builder
    .registerAndUse(UsersScanJob)
    .asSingleton()
    .addTag(ContainerTags.CRON_JOB);
  builder
    .registerAndUse(QuotaResetJob)
    .asSingleton()
    .addTag(ContainerTags.CRON_JOB);
  builder
    .registerAndUse(ResourceCacheJob)
    .asSingleton()
    .addTag(ContainerTags.CRON_JOB);
  builder
    .register(AgendaCronService)
    .useFactory(
      (c) =>
        new AgendaCronService(
          Object.values(JobCronName),
          new Agenda({
            db: { address: DATABASE_URL, collection: 'jobs' },
            processEvery: '2 minutes',
            maxConcurrency: 1,
            defaultConcurrency: 1,
            defaultLockLifetime: 1000 * 60 * 10,
            ensureIndex: true,
          }),
          c.get(Logger),
        ),
    )
    .asSingleton();
};

export async function runCron() {
  const cronService = getFromContainer<AgendaCronService>(AgendaCronService);
  const tags = findTaggedServiceIdentifiers<Jobber>(ContainerTags.CRON_JOB);
  const jobs = tags.map((tag) => getFromContainer<Jobber>(tag));
  await Bluebird.map(jobs, async (job) => job.register());
  return cronService.bootstrap();
}
