import { IpcMethodHandler } from "@david.uhlir/ipc-method";
import cluster from "cluster";
import { masterReciever, workerReciever } from "./recievers";

export class Worker {
  private static instance: Worker;

  private handler: IpcMethodHandler;

  private constructor() {
    if (!cluster.isWorker) {
      throw new Error("Worker class should be instantiated in the worker cluster");
    }
    this.handler = new IpcMethodHandler(['worker-com'], workerReciever);
  }

  public static getInstance(): Worker {
    if (!Worker.instance) {
      Worker.instance = new Worker();
    }
    return Worker.instance;
  }

  getReciever() {
    return this.handler.as<typeof masterReciever>();
  }
}
