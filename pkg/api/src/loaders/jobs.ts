import { Agenda } from 'agenda';

import LoggerInstance from './logger';
import { config } from '@/config/index';
import buildDiscovery from '@/services/discovery/build';
import { storeCache } from '@/services/meta/imdb';
import LibraryUpdate from '@/services/plex/library';
import QuotaSystem from '@/services/requests/quotas';
import trending from '@/services/tmdb/trending';

const TASK_NAME = {
  FULL_LIBRARY_SCAN: 'full library scan',
  PARTIAL_LIBRARY_SCAN: 'partial library scan',
  USERS_SCAN: 'users scan',
  USER_QUOTA_RESET: 'reset user quota',
  IMDB_CACHE: 'update imdb cache',
  TMDB_CACHE: 'update tmdb cache',
} as const;

export default ({ agenda }: { agenda: Agenda }) => {
  agenda.define(TASK_NAME.FULL_LIBRARY_SCAN, async (_job: any, done: any) => {
    try {
      await new LibraryUpdate().scan();
      await buildDiscovery();
    } catch (err) {
      LoggerInstance.error(
        `an error occured while attempting to run task '${
          TASK_NAME.FULL_LIBRARY_SCAN
          }'`,
        { label: 'task' },
      );
      LoggerInstance.debug(err);
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
        LoggerInstance.error(
          `an error occured while attempting to run task '${
            TASK_NAME.PARTIAL_LIBRARY_SCAN
            }'`,
          { label: 'task' },
        );
        LoggerInstance.debug(err);
      } finally {
        done();
      }
    },
  );

  agenda.define(TASK_NAME.USERS_SCAN, async (_job: any, done: any) => {
    try {
      await new LibraryUpdate().updateFriends();
    } catch (err) {
      LoggerInstance.error(
        `an error occured while attempting to run task '${
          TASK_NAME.USERS_SCAN
          }'`,
        { label: 'task' },
      );
      LoggerInstance.debug(err);
    } finally {
      done();
    }
  });

  agenda.define(TASK_NAME.USER_QUOTA_RESET, async (_job: any, done: any) => {
    try {
      await new QuotaSystem().reset();
    } catch (err) {
      LoggerInstance.error(
        `an error occured while attempting to run task '${
          TASK_NAME.USER_QUOTA_RESET
          }'`,
        { label: 'task' },
      );
      LoggerInstance.debug(err);
    } finally {
      done();
    }
  });

  agenda.define(TASK_NAME.IMDB_CACHE, async (_job: any, done: any) => {
    try {
      await storeCache();
    } catch (err) {
      LoggerInstance.error(
        `an error occured while attempting to run task '${
          TASK_NAME.IMDB_CACHE
          }'`,
        { label: 'task' },
      );
      LoggerInstance.debug(err);
    } finally {
      done();
    }
  });

  agenda.define(TASK_NAME.TMDB_CACHE, async (_job: any, done: any) => {
    try {
      await trending();
    } catch (err) {
      LoggerInstance.error(
        `an error occured while attempting to run task '${
          TASK_NAME.TMDB_CACHE
          }'`,
        { label: 'task' },
      );
      LoggerInstance.debug(err);
    } finally {
      done();
    }
  });

  agenda.start();
  agenda.every(config.get('tasks.library.full'), TASK_NAME.FULL_LIBRARY_SCAN);
  agenda.every(
    config.get('tasks.library.partial'),
    TASK_NAME.PARTIAL_LIBRARY_SCAN,
  );
  agenda.every(config.get('tasks.library.users'), TASK_NAME.USERS_SCAN);
  agenda.every(config.get('tasks.quotas'), TASK_NAME.USER_QUOTA_RESET);
  agenda.every('24 hours', [TASK_NAME.IMDB_CACHE, TASK_NAME.TMDB_CACHE]);
  agenda.purge();
};
