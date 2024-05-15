import { IpcMethodHandler } from '@david.uhlir/ipc-method';
import cluster from 'cluster';
import { Service } from 'diod';

import { masterReciever, workerReciever } from './recievers';

@Service()
export class Worker {
  private handler: IpcMethodHandler;

  constructor() {
    if (!cluster.isWorker) {
      throw new Error(
        'Worker class should be instantiated in the worker cluster',
      );
    }
    this.handler = new IpcMethodHandler(['worker-com'], workerReciever);
  }

  getReciever() {
    return this.handler.as<typeof masterReciever>();
  }
}
