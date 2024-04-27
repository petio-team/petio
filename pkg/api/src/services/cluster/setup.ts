import cluster from 'cluster';
import { container } from 'tsyringe';

import { IPC } from '@/infra/clusters/ipc';

export const setupWorkerProcesses = async () => {
  const jobWorker = cluster.fork({
    job: true,
  });
  container.resolve(IPC).register(jobWorker);

  const webWorker = cluster.fork({
    web: true,
  });
  container.resolve(IPC).register(webWorker);
};

export const setupWorkers = () => {
  const ipc = container.resolve(IPC);
  ipc.register(process);
  ipc.messageMaster({ action: 'onWorkerReady', data: true });
};
