import cluster from 'cluster';
import Koa from 'koa';
import 'module-alias/register';
import 'reflect-metadata';

import { HasConfig } from '@/config/index';
import { setupWorkerProcesses, workerHandler } from '@/infra/clusters/clusters';
import ipc from '@/infra/clusters/ipc';
import { listen } from '@/utils/http';
import startupMessage from '@/utils/startupMessage';

import('dotenv/config');
import('cache-manager/lib/stores/memory');

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
