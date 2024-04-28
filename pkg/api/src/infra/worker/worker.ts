import logger from "@/loaders/logger";
import cluster from "cluster";

export class Worker {
  constructor() {
    if (!cluster.isPrimary) {
      throw new Error("Worker class should be instantiated in the primary cluster");
    }
  }

  async createWorker(type: string) {
    return new Promise((resolve, reject) => {
      const worker = cluster.fork({
        [type]: true,
      });
      worker.once('online', () => {
        logger.debug(`Worker ${worker.process.pid} is ready!`);
        resolve(true);
      });
      worker.once('error', (error) => {
        logger.error(`Worker ${worker.process.pid} has an error: ${error}`);
        reject(error);
      });
      worker.on('exit', (code, signal) => {
        logger.debug(`Worker ${worker.process.pid} has exited with code ${code} and signal ${signal}`);
        if (!worker.exitedAfterDisconnect) {
          this.createWorker(type);
        }
      });
    });
  }
}
