import { EventSubscriber, On } from 'event-dispatch';
import { cpus } from 'os';
import { container } from 'tsyringe';

import { config, toObject } from '@/config/index';
import { IEventData, IPC } from '@/infra/clusters/ipc';
import { loadSystems } from '@/loaders';
import startupMessage from '@/utils/startupMessage';
import cluster from "cluster";

@EventSubscriber()
export class MasterEventSubscriber {
  private readyWorkers: number = 0;
  private ipc: IPC;

  constructor() {
    // Resolve the IPC container for sending data between master and or workers
    this.ipc = container.resolve(IPC);
  }

  @On("onWorkerReady")
  public async onWorkerReady(event: IEventData) {
    if (!event.source) {
      return;
    }

    let workerId = -1;
    for (const worker in cluster.workers) {
      const w = cluster.workers[worker];
      if (w && w.process.pid === event.source) {
        if (w.id) {
          workerId = w.id;
        }
      }
    }

    if (workerId === -1) {
      return;
    }

    this.ipc.messageWorker(workerId, {
      action: "onReady",
      data: {
        config: toObject(),
      }
    });

    this.readyWorkers++;
    if (this.readyWorkers === cpus().length) {
      // Show the startup message so the user knows everything is ready to go
      await startupMessage();
    }
  }
}

@EventSubscriber()
export class WorkerEventSubscriber {
  @On("onReady")
  public async onReady(event: IEventData) {
    // Check to make sure we provided the config field so we can load the config
    if (event.data.config) {
      // load the config data provided by the master process
      config.load(event.data.config);
    }

    // start loading all the main systems of the app
    await loadSystems();
  }

  @On("onConfigUpdate")
  public onConfigUpdate(event: IEventData) {
    // Because clusters don't share memory, when we update the config normally
    // that updated config only exists in the worker that was updated, so we need
    // a way to update other workers with those changes.
    config.load(event.data);
  }
}
