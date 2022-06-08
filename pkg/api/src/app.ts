import cluster from 'cluster';
import Koa from 'koa';
import 'module-alias/register';
import os from 'os';

import { masterHandler, workerHandler } from '@/clusters/events';
import ipc from '@/clusters/ipc';
import { HasConfig } from '@/config/index';
import { listen } from '@/util/http';
import startupMessage from '@/util/startupMessage';

import('dotenv/config');
import('cache-manager/lib/stores/memory');

export const setupWorkerProcesses = async () => {
  let numCores = os.cpus().length;

  for (let i = 0; i < numCores; i++) {
    const worker = cluster.fork({ output: i == 0 });
    ipc.register(worker, masterHandler);
  }

  cluster.on('exit', function (_worker, _code, _signal) {
    cluster.fork();
  });
};

async function setupApp(output: boolean) {
  const app = new Koa();

  // load all the loaders
  (await import('./loaders')).default({ httpApp: app });

  // run server
  listen({ httpApp: app });

  if (output) {
    startupMessage();
  }
}

const setupServer = async () => {
  try {
    if (cluster.isPrimary) {
      const exists = await HasConfig();
      if (exists) {
        setupWorkerProcesses();
      } else {
        setupApp(true);
      }
    } else {
      ipc.register(process, workerHandler);
      setupApp(process.env.output === 'true');
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

setupServer();
