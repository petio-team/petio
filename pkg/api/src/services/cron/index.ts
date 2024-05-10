import { Agenda } from '@hokify/agenda';
import Bluebird from 'bluebird';
import { ContainerBuilder } from 'diod';

import { DATABASE_URL } from '@/infrastructure/config/env';
import {
  findTaggedServiceIdentifiers,
  getFromContainer,
} from '@/infrastructure/container/container';
import { Logger } from '@/infrastructure/logger/logger';
import { Jobber } from '@/services/cron/job';
import { JobFullLibraryScan } from '@/services/cron/jobs/full_library_scan';
import { JobImdbCache } from '@/services/cron/jobs/imdb_cache';
import { JobPartialLibraryScan } from '@/services/cron/jobs/partial_library_scan';
import { JobQuotaReset } from '@/services/cron/jobs/quota_reset';
import { JobTmdbCache } from '@/services/cron/jobs/tmdb_cache';
import { JobUsersScan } from '@/services/cron/jobs/users_scan';

import { AgendaCronService } from './agenda-cron';
import { JobCronName } from './types';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(JobFullLibraryScan).asSingleton().addTag('job');
  builder.registerAndUse(JobPartialLibraryScan).asSingleton().addTag('job');
  builder.registerAndUse(JobUsersScan).asSingleton().addTag('job');
  builder.registerAndUse(JobQuotaReset).asSingleton().addTag('job');
  builder.registerAndUse(JobTmdbCache).asSingleton().addTag('job');
  builder.registerAndUse(JobImdbCache).asSingleton().addTag('job');

  builder
    .register(AgendaCronService)
    .useFactory(
      (c) =>
        new AgendaCronService(
          [
            JobCronName.FULL_LIBRARY_SCAN,
            JobCronName.PARTIAL_LIBRARY_SCAN,
            JobCronName.DISCOVERY_SCAN,
            JobCronName.USERS_SCAN,
            JobCronName.QUOTA_RESET,
            JobCronName.TMDB_CACHE,
            JobCronName.IMDB_CACHE,
          ],
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
  const tags = findTaggedServiceIdentifiers<Jobber>('job');
  const jobs = tags.map((tag) => getFromContainer<Jobber>(tag));
  await Bluebird.map(jobs, async (job) => job.register());
  return cronService.bootstrap();
}
