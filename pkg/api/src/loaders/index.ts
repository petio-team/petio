import cluster from 'cluster';

import agendaFactory from '@/loaders/agenda';
import config from '@/loaders/config';
import di from '@/loaders/di';
import '@/loaders/events';
import jobs from '@/loaders/jobs';
import appRouter from '@/loaders/koa';
import mongoose from '@/loaders/mongoose';
import { setupWorkerProcesses, setupWorkers } from '@/services/cluster/setup';
import startupMessage from '@/utils/startupMessage';

export default async () => {
  // inject everything into di
  di();

  // if we are the master process,
  if (cluster.isPrimary) {
    // load the config if the file exists, else use defaults
    const exists = await config();
    if (exists) {
      // setup workers and run forks
      setupWorkerProcesses();
    } else {
      // load http server
      appRouter();
      // Show the startup message so the user knows everything is ready to go
      await startupMessage();
    }
  } else if (cluster.isWorker) {
    // load worker events
    setupWorkers();
  }
};

export const loadSystems = async () => {
  // load database
  const mongoConnection = await mongoose();

  // load agenda
  const agenda = agendaFactory({ mongoConnection });

  // load jobs
  jobs({ agenda });

  // load http server
  appRouter();
};
