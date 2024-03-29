import { EventSubscriber, On } from "event-dispatch";
import { config } from '@/config/index';
import { IEventData } from "@/infra/clusters/ipc";
import { loadSystems } from "@/loaders";
import logger from "@/loaders/logger";

@EventSubscriber()
export default class WorkerEventSubscriber {
  // eslint-disable-next-line class-methods-use-this
  @On("onReady")
  public async onReady(event: IEventData) {
    // Check to make sure we provided the config field so we can load the config
    if (event.data.config) {
      // load the config data provided by the master process
      config.load(event.data.config);
      logger.setLevel(config.get('logger.level'));
      logger.debug(`Worker ${process.pid} is ready!`);
    }

    // start loading all the main systems of the app
    await loadSystems();
  }

  // eslint-disable-next-line class-methods-use-this
  @On("onConfigUpdate")
  public onConfigUpdate(event: IEventData) {
    // Because clusters don't share memory, when we update the config normally
    // that updated config only exists in the worker that was updated, so we need
    // a way to update other workers with those changes.
    config.load(event.data);
  }
}
