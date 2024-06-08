import { Agenda } from '@hokify/agenda';
import { ContainerBuilder } from 'diod';

import { DATABASE_URL } from '@/infrastructure/config/env';
import { ContainerTags } from '@/infrastructure/container/constants';
import { Logger } from '@/infrastructure/logger/logger';
import { ClearCacheJob } from '@/services/cron/jobs/clear-cache';
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
    .addTag(ContainerTags.AGENDA_CRON_JOB);
  builder
    .registerAndUse(ContentScanJob)
    .asSingleton()
    .addTag(ContainerTags.AGENDA_CRON_JOB);
  builder
    .registerAndUse(UsersScanJob)
    .asSingleton()
    .addTag(ContainerTags.AGENDA_CRON_JOB);
  builder
    .registerAndUse(QuotaResetJob)
    .asSingleton()
    .addTag(ContainerTags.AGENDA_CRON_JOB);
  builder
    .registerAndUse(ResourceCacheJob)
    .asSingleton()
    .addTag(ContainerTags.AGENDA_CRON_JOB);
  builder
    .registerAndUse(ClearCacheJob)
    .asSingleton()
    .addTag(ContainerTags.AGENDA_CRON_JOB);
  builder
    .register(AgendaCronService)
    .useFactory(
      (c) =>
        new AgendaCronService(
          Object.values(JobCronName),
          new Agenda({
            db: { address: DATABASE_URL, collection: 'jobs' },
            processEvery: '2 minutes',
            maxConcurrency: 2,
            defaultConcurrency: 1,
            defaultLockLifetime: 1000 * 60 * 10,
            ensureIndex: true,
          }),
          c.get(Logger),
        ),
    )
    .asSingleton();
};
