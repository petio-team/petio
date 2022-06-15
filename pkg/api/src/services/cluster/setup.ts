import cluster from 'cluster';
import os from 'os';
import { container } from 'tsyringe';

import { IPC } from '@/infra/clusters/ipc';

export const setupWorkerProcesses = async () => {
  let numCores = os.cpus().length;

  for (let i = 0; i < numCores; i++) {
    const worker = cluster.fork();
    container.resolve(IPC).register(worker);
  }

  cluster.on('exit', function (_worker, _code, _signal) {
    cluster.fork();
  });
};

export const setupWorkers = () => {
  const ipc = container.resolve(IPC);
  ipc.register(process);
  ipc.messageMaster({ action: 'onWorkerReady', data: true });
};
