import { EventDispatcher } from 'event-dispatch';
import { container } from 'tsyringe';
import { Logger } from 'winston';

import logger from '@/loaders/logger';
import MediaServerDB from '@/models/mediaserver/db';
import { IMediaServerRepository } from '@/models/mediaserver/repo';
import { NotificationDB } from '@/models/notification/db';
import { INotificationRepository } from '@/models/notification/repo';
import SettingsDB from "@/models/settings/db";
import ISettingsRepository from "@/models/settings/repository";
import { UserDB } from '@/models/user/db';
import { IUserRepository } from '@/models/user/repo';

export default () => {
  container.register<EventDispatcher>('Events', { useValue: new EventDispatcher() });
  container.register<Logger>('Logger', { useValue: logger });
  // Repositories
  container.register<IMediaServerRepository>('MediaServer', { useClass: MediaServerDB });
  container.register<INotificationRepository>('Notification', { useClass: NotificationDB });
  container.register<IUserRepository>('User', { useClass: UserDB });
  container.register<ISettingsRepository>('Settings', { useClass: SettingsDB });
};
