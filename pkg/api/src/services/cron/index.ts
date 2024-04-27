import { Agenda } from '@hokify/agenda';
import { Connection } from 'mongoose';

import discovery from '../discovery';
import LibraryUpdate from '../plex/library';
import QuotaSystem from '../requests/quotas';
import trending from '../tmdb/trending';
import { AgendaCronService } from './agenda-cron';
import { JobCronName } from './types';

export async function runCron(dbConn: Connection['db']) {
  const cronService = new AgendaCronService(
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
      mongo: dbConn,
      db: { collection: 'jobs' },
      processEvery: '2 minutes',
      maxConcurrency: 1,
      defaultConcurrency: 1,
      defaultLockLifetime: 1000 * 60 * 10,
      ensureIndex: true,
    }),
  );
  Promise.all([
    cronService.add(
      JobCronName.FULL_LIBRARY_SCAN,
      async () => new LibraryUpdate().scan(),
      '1 days',
      {
        lockLifetime: 1000 * 60 * 60 * 2,
      },
    ),
    cronService.add(
      JobCronName.PARTIAL_LIBRARY_SCAN,
      async () => new LibraryUpdate().partial(),
      '6 hours',
      {},
    ),
    cronService.add(
      JobCronName.USERS_SCAN,
      async () => new LibraryUpdate().scan(),
      '30 minutes',
      {},
    ),
    cronService.add(
      JobCronName.DISCOVERY_SCAN,
      async () => discovery(),
      '1 days',
      {},
    ),
    cronService.add(
      JobCronName.QUOTA_RESET,
      async () => new QuotaSystem().reset(),
      '1 days',
      {},
    ),
    cronService.add(
      JobCronName.TMDB_CACHE,
      async () => {
        await trending();
      },
      '1 days',
      {},
    ),
    cronService.add(JobCronName.IMDB_CACHE, async () => {}, '1 days', {}),
  ]);
  await cronService.bootstrap();
}
