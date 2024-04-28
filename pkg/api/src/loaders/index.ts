import cluster from 'cluster';

import api from '@/api';
import ConfigLoader from '@/loaders/config';
import mongoose from '@/loaders/mongoose';
import { runCron } from '@/services/cron';
import startupMessage from '@/utils/startupMessage';
import { SharedCache } from '@david.uhlir/shared-cache';
import { HasConfig, config, toObject } from '@/config';
import { Master } from '@/infra/worker/master';
import logger from './logger';

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
  // TODO: migrate config to db and remove it/rename it to prevent doing this
  const hasConfig = await HasConfig();
  if (hasConfig) {
    await SharedCache.setData('hasConfig', hasConfig);
    const configLoaded = await ConfigLoader();
    if (configLoaded) {
      await SharedCache.setData('config', toObject());
    }
  }

  // run workers
  await Master
    .getInstance()
    .runWorkers();
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
    await mongoose();
  }

  if (process.env.web) {
    logger.debug(`Web worker running on ${process.pid}`);
    startupMessage();
    if (!hasConfig) {
      logger.warn(
        'Initial setup is required, please proceed to the Web UI to begin the setup',
      );
    }
    api();
  }

  if (hasConfig && process.env.job) {
    logger.debug(`Job worker running on ${process.pid}`);
    await runCron();
  }
}

export default async () => {
  if (cluster.isPrimary) {
    await doPrimary();
  } else if (cluster.isWorker) {
    await doWorker();
  }
}
