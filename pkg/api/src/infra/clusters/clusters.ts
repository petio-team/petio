import cluster from 'cluster';
import os from 'os';

import { config } from '@/config/index';
import ipc from '@/infra/clusters/ipc';

import { IData } from './ipc';

// Handle events passed by workers
export const masterHandler = (_data: IData) => {};

// Handle events passed by workers and master
export const workerHandler = (data: IData) => {
  if (data.action === 'update_config') {
    config.load(data.data);
  }
};

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
