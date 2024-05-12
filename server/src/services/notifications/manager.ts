import { map } from 'bluebird';
import { Service } from 'diod';

import { Logger } from '@/infrastructure/logger/logger';

import { INotify, NotifyEvent, NotifyPayload } from './notify';

@Service()
export class NotificationManager {
  private notifications: INotify[];

  constructor(notifications: INotify[], private logger?: Logger) {
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
        concurrency: 2,
      },
    );
  }
}
