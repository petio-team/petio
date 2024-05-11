import cluster from 'cluster';
import 'reflect-metadata';

import { createKoaServer } from '@/api';
import builder from '@/builder';
import { tryLoadEnv } from '@/infrastructure/config/dotenv';
import {
  DATABASE_URL,
  HTTP_ADDR,
  HTTP_BASE_PATH,
  HTTP_PORT,
  PGID,
  PUID,
} from '@/infrastructure/config/env';
import {
  getFromContainer,
  useContainer,
} from '@/infrastructure/container/container';
import { MongooseDatabaseConnection } from '@/infrastructure/database/connection';
import logger from '@/infrastructure/logger/logger';
import { Master } from '@/infrastructure/worker/master';
import { runCron } from '@/services/cron';
import { MigrationService } from '@/services/migration/migration';
import { SettingsService } from '@/services/settings/settings';

import appConfig from '../package.json';

/**
 * Creates a default database connection using Mongoose.
 *
 * @returns A promise that resolves to the default database connection.
 */
async function createDefaultDbConnection() {
  return getFromContainer(MongooseDatabaseConnection).connect(
    'default',
    DATABASE_URL,
    {
      autoCreate: true,
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    },
    true,
  );
}

/**
 * Performs the primary loading process.
 *
 * @remarks
 * This function checks if there is a configuration available, and if so, it loads it into the shared cache.
 * It then runs the workers using the Master instance.
 *
 * @returns A promise that resolves when the primary loading process is complete.
 */
async function doPrimary() {
  // Attempt to file old configuration files and migrate them
  await getFromContainer(MigrationService).migrateOldFiles();

  // Validate db connection (this should be valid even after config migration)
  await createDefaultDbConnection();

  // Load settings into cache
  await getFromContainer(SettingsService).getSettings();

  logger.info(`Petio v${appConfig.version} [debug] [pid:${PUID},gid:${PGID}]`);

  // run workers
  await getFromContainer(Master).runWorkers();
}

/**
 * Performs the necessary initialization and starts the worker based on the environment variables.
 *
 * If the configuration is valid, it loads the configuration, services, and starts the web worker.
 * If the configuration is not valid, it displays a warning message to proceed with the initial setup.
 * If the configuration is valid and the environment variable 'job' is set, it starts the job worker.
 */
async function doWorker() {
  await createDefaultDbConnection();

  // Get the settings from cache
  const settings = await getFromContainer(SettingsService).getSettings();

  if (process.env.web) {
    logger.info(
      `Serving Web UI on http://${HTTP_ADDR}:${HTTP_PORT}${HTTP_BASE_PATH}`,
    );
    if (!settings.initialSetup) {
      logger.warn(
        'Initial setup is required, please proceed to the Web UI to begin the setup',
      );
    }
    await createKoaServer();
  }

  if (settings.initialSetup && process.env.job) {
    await runCron();
  }
}

(async (): Promise<void> => {
  // load .env file
  tryLoadEnv();
  // build containers
  useContainer(builder());

  try {
    if (cluster.isPrimary) {
      await doPrimary();
    } else if (cluster.isWorker) {
      await doWorker();
    }
  } catch (error) {
    logger.error('something unexpected went wrong', error);
    process.exit(1);
  }
})();
