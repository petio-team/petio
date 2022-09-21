import cluster from 'cluster';
import process from 'process';
import { EventDispatcher } from "event-dispatch";
import { inject, injectable } from "tsyringe";

export interface IEventData {
  action: string;
  data: any;
  source?: number;
}

interface IPack {
  toMaster: boolean;
  toWorkers: boolean;
  toSource: boolean;
  data: IEventData;
  source: number;
}

@injectable()
export class IPC {
  constructor(
    @inject("Events") private events: EventDispatcher,
  ) {
    Object.getOwnPropertyNames(IPC.prototype).forEach((key) => {
      if (key !== 'constructor') {
        this[key] = this[key].bind(this);
      }
    });
  }

  // This function can be used by workers to send a message to the master
  public messageMaster(data: IEventData) {
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
  public messageWorkers(data: IEventData) {
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
  public messageSiblings(data: IEventData) {
    const pack: IPack = {
      toMaster: false,
      toWorkers: true,
      toSource: false,
      data,
      source: process.pid,
    };
    this.dispatch(pack);
  }

  public messageWorker(pid: number, data: IEventData) {
    const pack: IPack = {
      toMaster: false,
      toWorkers: true,
      toSource: true,
      data,
      source: pid,
    };
    this.dispatch(pack);
  }

  // Message receiver of the master
  private masterHandler(pack: IPack) {
    if (pack.toMaster === true) {
      pack.data.source = pack.source;
      this.events.dispatch(pack.data.action, pack.data);
    }
    this.dispatch(pack);
  }

  // Message receiver of the workers
  private workerHandler(pack: IPack) {
    if (pack.toSource !== false || pack.source !== process.pid) {
      if (this.events) {
        pack.data.source = pack.source;
        this.events.dispatch(pack.data.action, pack.data);
      }
    }
  }

  // Common function called to send messages to other processes
  public dispatch(pack: IPack) {
    if (cluster.isPrimary) {
      if (pack.toWorkers === true && pack.toSource === false) {
        for (const key in cluster.workers) {
          if (cluster && cluster.workers && cluster.workers[key]) {
            (cluster.workers[key] as any).send(pack);
          }
        }
      } else if (pack.toWorkers) {
        for (const key in cluster.workers) {
          if (cluster && cluster.workers && cluster.workers[key] && pack.source === cluster.workers[key]?.id) {
            (cluster.workers[key] as any).send(pack);
          }
        }
      }
    } else if (pack.toMaster === true || pack.toWorkers === true) {
        (process as any).send(pack);
      }
  }

  // Used to register processes and custom callback functions
  public register(process) {
    if (cluster.isPrimary) {
      process.on('message', this.masterHandler);
    } else {
      process.on('message', this.workerHandler);
    }
  }
}
