import { map } from 'bluebird';
import { Service } from 'diod';
import pino from 'pino';

import { Logger } from '@/infrastructure/logger/logger';
import { NotificationRepository } from '@/resources/notification/repository';
import { BaseNotificationProvider } from '@/services/notifications/base-provider';
import { providers } from '@/services/notifications/providers';
import { NotifyEvent, NotifyPayload } from '@/services/notifications/types';

@Service()
export class NotificationService {
  private logger: pino.Logger;

  private notifications: BaseNotificationProvider<any>[] = [];

  constructor(
    private notificationRepo: NotificationRepository,
    logger: Logger,
  ) {
    this.logger = logger.child({ module: 'services.notification.service' });
  }

  public async loadNotifications() {
    const notifications = await this.notificationRepo.findAll();
    this.notifications = notifications.map((notification) => {
      const provider = providers[notification.type];
      if (!provider.validator()) {
        throw new Error('Invalid notification provider');
      }
      // eslint-disable-next-line new-cap
      return new provider.provider(notification.getProps());
    });
  }

  public async send(type: NotifyEvent, data: NotifyPayload) {
    await map(
      this.notifications,
      async (instance) => {
        try {
          await instance.sendNotification(type, data);
        } catch (err) {
          this.logger.error(err);
        }
      },
      {
        concurrency: 2,
      },
    );
  }
}
