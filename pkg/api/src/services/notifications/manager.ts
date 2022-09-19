import { map } from 'bluebird';
import { inject, injectable } from "tsyringe";
import { Logger } from "winston";
import { INotify, NotifyEvent, NotifyPayload } from "./notify";
import { config } from '@/config/index';

@injectable()
export class NotificationManager {
  private notifications: INotify[];

  constructor(
    notifications: INotify[],
    @inject("Logger") private logger?: Logger,
  ) {
    this.notifications = notifications;
  }

  public async Send(type: NotifyEvent, data: NotifyPayload) {
    await map(
      this.notifications,
      async (instance) => {
        try {
          await instance.Send(type, data);
        } catch (err) {
          this.logger!.error(err);
        }
      },
      {
        concurrency: config.get('general.concurrency'),
      },
    );
  }
}

