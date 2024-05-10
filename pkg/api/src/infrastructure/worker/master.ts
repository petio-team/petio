import { IpcMethodHandler } from '@david.uhlir/ipc-method';
import cluster from 'cluster';

import logger from '@/infrastructure/logger/logger';

import { masterReciever, workerReciever } from './recievers';

export class Master {
  private handler: IpcMethodHandler;

  constructor() {
    if (!cluster.isPrimary) {
      throw new Error(
        'Master class should be instantiated in the primary cluster',
      );
    }
    this.handler = new IpcMethodHandler(['worker-com'], masterReciever);
  }

  getReciever() {
    return this.handler.as<typeof workerReciever>();
  }

  async runWorkers() {
    return Promise.all(['job', 'web'].map(async (w) => this.createWorker(w)));
  }

  private async createWorker(type: string) {
    return new Promise((resolve, reject) => {
      const worker = cluster.fork({
        [type]: true,
      });
      worker.once('online', () => {
        logger.debug(`Worker (${type}) ${worker.process.pid} is ready!`);
        resolve(true);
      });
      worker.once('error', (error) => {
        logger.error(
          `Worker (${type}) ${worker.process.pid} has an error: ${error}`,
        );
        reject(error);
      });
      worker.on('exit', (code, signal) => {
        logger.debug(
          `Worker (${type}) ${worker.process.pid} has exited with code ${code} and signal ${signal}`,
        );
        if (!worker.exitedAfterDisconnect) {
          this.createWorker(type);
        }
      });
    });
  }
}
