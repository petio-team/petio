import { Agenda } from '@hokify/agenda';

import { config } from '@/config/index';
import loggerMain from '@/loaders/logger';
import buildDiscovery from '@/services/discovery/build';
import { storeCache } from '@/services/meta/imdb';
import LibraryUpdate from '@/services/plex/library';
import QuotaSystem from '@/services/requests/quotas';
import trending from '@/services/tmdb/trending';

const logger = loggerMain.core.child({ label: 'loaders.jobs' });

const TASK_NAME = {
  FULL_LIBRARY_SCAN: 'full library scan',
  PARTIAL_LIBRARY_SCAN: 'partial library scan',
  USERS_SCAN: 'users scan',
  USER_QUOTA_RESET: 'reset user quota',
  IMDB_CACHE: 'update imdb cache',
  TMDB_CACHE: 'update tmdb cache',
} as const;

export default async ({ agenda }: { agenda: Agenda; }) => {
  agenda.define(TASK_NAME.FULL_LIBRARY_SCAN, async (_job: any, done: any) => {
    try {
      await new LibraryUpdate().scan();
      await buildDiscovery();
    } catch (err) {
      logger.error(`an error occured while attempting to run task '${TASK_NAME.FULL_LIBRARY_SCAN}'`, err);
    } finally {
      done();
    }
  });

  agenda.define(
    TASK_NAME.PARTIAL_LIBRARY_SCAN,
    async (_job: any, done: any) => {
      try {
        await new LibraryUpdate().partial();
      } catch (err) {
        logger.error(`an error occured while attempting to run task '${TASK_NAME.PARTIAL_LIBRARY_SCAN}'`, err);
      } finally {
        done();
      }
    },
  );

  agenda.define(TASK_NAME.USERS_SCAN, async (_job: any, done: any) => {
    try {
      const library = new LibraryUpdate();
      await library.updateFriends();
    } catch (err) {
      logger.error(`an error occured while attempting to run task '${TASK_NAME.USERS_SCAN}'`, err);
    } finally {
      done();
    }
  });

  agenda.define(TASK_NAME.USER_QUOTA_RESET, async (_job: any, done: any) => {
    try {
      await new QuotaSystem().reset();
    } catch (err) {
      logger.error(`an error occured while attempting to run task '${TASK_NAME.USER_QUOTA_RESET}'`, err);
    } finally {
      done();
    }
  });

  agenda.define(TASK_NAME.IMDB_CACHE, async (_job: any, done: any) => {
    try {
      await storeCache();
    } catch (err) {
      logger.error(`an error occured while attempting to run task '${TASK_NAME.IMDB_CACHE}'`, err);
    } finally {
      done();
    }
  });

  agenda.define(TASK_NAME.TMDB_CACHE, async (_job: any, done: any) => {
    try {
      await trending();
    } catch (err) {
      logger.error(`an error occured while attempting to run task '${TASK_NAME.TMDB_CACHE}'`, err);
    } finally {
      done();
    }
  });

  await agenda.start();
  await agenda.every(config.get('tasks.library.full'), TASK_NAME.FULL_LIBRARY_SCAN);
  await agenda.every(
    config.get('tasks.library.partial'),
    TASK_NAME.PARTIAL_LIBRARY_SCAN,
  );
  await agenda.every(config.get('tasks.library.users'), TASK_NAME.USERS_SCAN);
  await agenda.every(config.get('tasks.quotas'), TASK_NAME.USER_QUOTA_RESET);
  await agenda.every('24 hours', [TASK_NAME.IMDB_CACHE, TASK_NAME.TMDB_CACHE]);

  // temp solution until library fixes it
  try {
    await agenda.purge();
    // eslint-disable-next-line no-empty
  } catch (_) { }
};
