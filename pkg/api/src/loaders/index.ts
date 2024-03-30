import cluster from 'cluster';

import logger from "./logger";
import api from "@/api";
import { config as mainConfig } from '@/config';
import agendaFactory from '@/loaders/agenda';
import config from '@/loaders/config';
import di from '@/loaders/di';
import '@/loaders/events';
import jobs from '@/loaders/jobs';
import mongoose from '@/loaders/mongoose';
import cache from "@/services/cache";
import { setupWorkerProcesses, setupWorkers } from '@/services/cluster/setup';
import startupMessage from '@/utils/startupMessage';

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
    // re-set log level
    logger.setLevel(mainConfig.get('logger.level'));
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
  // load database
  const mongoConnection = await mongoose();
  // load agenda
  const agenda = agendaFactory({ mongoConnection });
  // load jobs
  await jobs({ agenda });
  // load http server
  await runAPI();
};
