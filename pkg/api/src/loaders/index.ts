/* eslint-disable import/order */
import cluster from 'cluster';

import api from '@/api';
import config from '@/loaders/config';
import di from '@/loaders/di';
import '@/loaders/events';
import mongoose from '@/loaders/mongoose';
import cache from '@/services/cache';
import { setupWorkerProcesses, setupWorkers } from '@/services/cluster/setup';
import { runCron } from '@/services/cron';
import startupMessage from '@/utils/startupMessage';

import logger from './logger';

const runAPI = async () => {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  api(init);
};

const init = async () => {
  // inject everything into di
  di();
  // if we are the master process,
  if (cluster.isPrimary) {
    // load the config if the file exists, else use defaults
    const exists = await config();
    // if config exists lets run first time cache, and clusters
    if (exists) {
      // load database
      await mongoose();
      // check for first time cache
      await cache();
      // setup workers and run forks
      await setupWorkerProcesses();
    } else {
      // load http server
      await runAPI();
    }
    // show the startup message so the user knows everything is ready to go
    startupMessage();
    if (!exists) {
      logger.warn(
        'Initial setup is required, please proceed to the Web UI to begin the setup',
      );
    }
  } else if (cluster.isWorker) {
    // load worker events
    setupWorkers();
  }
};
export default init;

export const loadSystems = async () => {
  logger.debug(`Worker ${process.pid} is ready!`);
  // load database
  await mongoose();
  if (process.env.job) {
    logger.debug(`job worker running on ${process.pid}`);
    // load jobs
    runCron();
  }
  if (process.env.web) {
    logger.debug(`web worker running on ${process.pid}`);
    // load http server
    await runAPI();
  }
};
