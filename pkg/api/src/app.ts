import { SharedCache } from '@david.uhlir/shared-cache';
import cluster from 'cluster';
import dotenv from 'dotenv';
import 'reflect-metadata';

import { createKoaServer } from '@/api';
import { HasConfig, config, toObject } from '@/config';
import {
  HTTP_ADDR,
  HTTP_BASE_PATH,
  HTTP_PORT,
  PGID,
  PUID,
} from '@/infra/config/env';
import { useContainer } from '@/infra/container/container';
import { MongooseDatabase } from '@/infra/database/mongoose';
import logger from '@/infra/logger/logger';
import { Master } from '@/infra/worker/master';
import builder from '@/loaders//builder';
import ConfigLoader from '@/loaders/config';
import { runCron } from '@/services/cron';

import appConfig from '../package.json';

/**
 * Checks if the application has a valid configuration.
 * @returns A promise that resolves to a boolean indicating whether the configuration is valid.
 */
async function hasValidConfig() {
  try {
    return await SharedCache.getData<boolean>('hasConfig');
  } catch (e) {
    return false;
  }
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
  // Validate db connection
  await new MongooseDatabase().getConnection();

  // TODO: migrate config to db and remove it/rename it to prevent doing this
  const hasConfig = await HasConfig();
  if (hasConfig) {
    await SharedCache.setData('hasConfig', hasConfig);
    const configLoaded = await ConfigLoader();
    if (configLoaded) {
      await SharedCache.setData('config', toObject());
    }
  }

  logger.info(
    `Petio v${appConfig.version} [${
      logger.core().level
    }] [pid:${PUID},gid:${PGID}]`,
  );

  // run workers
  await Master.getInstance().runWorkers();
}

/**
 * Performs the necessary initialization and starts the worker based on the environment variables.
 * If the configuration is valid, it loads the configuration, services, and starts the web worker.
 * If the configuration is not valid, it displays a warning message to proceed with the initial setup.
 * If the configuration is valid and the environment variable 'job' is set, it starts the job worker.
 */
async function doWorker() {
  const hasConfig = await hasValidConfig();
  if (hasConfig) {
    const cfg = await SharedCache.getData('config');
    config.load(cfg);
    // load services
    await new MongooseDatabase().getConnection();
  }

  if (process.env.web) {
    logger.info(
      `Serving Web UI on http://${HTTP_ADDR}:${HTTP_PORT}${HTTP_BASE_PATH}`,
    );
    if (!hasConfig) {
      logger.warn(
        'Initial setup is required, please proceed to the Web UI to begin the setup',
      );
    }
    await createKoaServer();
  }

  if (hasConfig && process.env.job) {
    await runCron();
  }
}

(async (): Promise<void> => {
  // load .env file
  dotenv.config({ override: true });
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
