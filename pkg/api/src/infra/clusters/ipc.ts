import cluster from 'cluster';
import process from 'process';

export interface IData {
  action: string;
  data: any;
}

interface IPack {
  toMaster: boolean;
  toWorkers: boolean;
  toSource: boolean;
  data: IData;
  source: number;
}

class IPC {
  // This function will be called on receiving a message
  // Can be overwritten when `register` is called
  private CALLBACK = (_data: IData): void => {};

  constructor() {
    Object.getOwnPropertyNames(IPC.prototype).forEach((key) => {
      if (key !== 'constructor') {
        this[key] = this[key].bind(this);
      }
    });
  }

  // This function can be used by workers to send a message to the master
  public messageMaster(data: IData) {
    const pack: IPack = {
      toMaster: true,
      toWorkers: false,
      toSource: false,
      data,
      source: process.pid,
    };
    this.dispatch(pack);
  }

  // This function can be used to send a message to all workers
  public messageWorkers(data: IData) {
    const pack: IPack = {
      toMaster: false,
      toWorkers: true,
      toSource: true,
      data,
      source: process.pid,
    };
    this.dispatch(pack);
  }

  // This function can be used to send a message to all the siblings of a worker
  // Differs with `messageWorkers` as the sender's callback will not be called
  public messageSiblings(data: IData) {
    const pack: IPack = {
      toMaster: false,
      toWorkers: true,
      toSource: false,
      data,
      source: process.pid,
    };
    this.dispatch(pack);
  }

  // Message receiver of the master
  private masterHandler(pack: IPack) {
    if (pack.toMaster === true) {
      this.CALLBACK(pack.data);
    }
    this.dispatch(pack);
  }

  // Message receiver of the workers
  private workerHandler(pack: IPack) {
    if (pack.toSource !== false || pack.source !== process.pid) {
      this.CALLBACK(pack.data);
    }
  }

  // Common function called to send messages to other processes
  public dispatch(pack: IPack) {
    if (cluster.isPrimary) {
      if (pack.toWorkers === true) {
        for (var key in cluster.workers) {
          if (cluster && cluster.workers && cluster.workers[key]) {
            (cluster.workers[key] as any).send(pack);
          }
        }
      }
    } else {
      if (pack.toMaster === true || pack.toWorkers === true) {
        (process as any).send(pack);
      }
    }
  }

  // Used to register processes and custom callback functions
  public register(process, callback) {
    if (callback !== undefined && typeof callback === 'function') {
      this.CALLBACK = callback;
    }
    if (cluster.isPrimary) {
      process.on('message', this.masterHandler);
    } else {
      process.on('message', this.workerHandler);
    }
  }
}

const ipc = new IPC();
export default ipc;
