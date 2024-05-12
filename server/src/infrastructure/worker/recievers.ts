import cluster, { Worker } from "cluster";

export const masterReciever = {
  restartWorkers: async () => {
    if (cluster.workers) {
      const workers = Object.keys(cluster.workers).reduce((acc, workerId) => [...acc, cluster.workers?.[workerId]], []);
      workers.forEach((worker: Worker) => {
        worker.kill('SIGINT');
      });
    }
  },
};

export const workerReciever = {
  restartProcess: async () => process.exit(0),
};
