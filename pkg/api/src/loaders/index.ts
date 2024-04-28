import cluster from 'cluster';

import api from '@/api';
import ConfigLoader from '@/loaders/config';
import mongoose from '@/loaders/mongoose';
import { runCron } from '@/services/cron';
import startupMessage from '@/utils/startupMessage';
import { Worker } from '@/infra/worker/worker';
import { SharedCache } from '@david.uhlir/shared-cache';
import { HasConfig, config, toObject } from '@/config';
import logger from './logger';

async function hasValidConfig() {
  try {
    return await SharedCache.getData<boolean>('hasConfig');
  } catch (e) {
    return false;
  }
}

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

  const worker = new Worker();
  await Promise.all([
    ["job", "web"]
      .map(async (w) => worker.createWorker(w)),
  ]);
}

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
