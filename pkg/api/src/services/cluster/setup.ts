import cluster from 'cluster';
import os from 'os';
import { container } from 'tsyringe';

import { IPC } from '@/infra/clusters/ipc';

export const setupWorkerProcesses = async () => {
  const numCores = os.cpus().length;

  for (let i = 0; i < numCores; i += 1) {
    const worker = cluster.fork();
    container.resolve(IPC).register(worker);
  }

  cluster.on('exit', () => {
    cluster.fork();
  });
};

export const setupWorkers = () => {
  const ipc = container.resolve(IPC);
  ipc.register(process);
  ipc.messageMaster({ action: 'onWorkerReady', data: true });
};
