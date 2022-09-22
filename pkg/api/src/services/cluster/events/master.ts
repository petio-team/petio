import cluster from "cluster";
import { EventSubscriber, On } from "event-dispatch";
import { container } from "tsyringe";
import { toObject } from "@/config";
import { IEventData, IPC } from "@/infra/clusters/ipc";

@EventSubscriber()
export default class MasterEventSubscriber {
  private ipc = container.resolve(IPC);

  @On("onWorkerReady")
  public async onWorkerReady(event: IEventData): Promise<void> {
    if (!event.source) {
      return;
    }

    if (!cluster.workers) {
      return;
    }
    const { workers } = cluster;

    let workerId = -1;
    Object.keys(workers).forEach((worker) => {
      const w = workers[worker];
      if (w && w.process.pid === event.source) {
        if (w.id) {
          workerId = w.id;
        }
      }
    });

    if (workerId === -1) {
      return;
    }

    this.ipc.messageWorker(workerId, {
      action: "onReady",
      data: {
        config: toObject(),
      }
    });
  }
}
