import { container } from 'tsyringe';

import logger from '@/loaders/logger';
import { INotify } from './notify';
import {
  DiscordProvider,
  authConfigToDiscordSettings,
} from './providers/discord';
import { EmailProvider, authConfigToEmailSettings } from './providers/email';
import {
  TelegramProvider,
  authConfigToTelegramSettings,
} from './providers/telegram';
import { AuthConfig } from './url/url';

export interface INotification {
  enabled: boolean;
}

export const getNotificationProvider = (
  config: AuthConfig,
): INotify | undefined => {
  switch (config.service) {
    case 'discord':
      return new DiscordProvider(authConfigToDiscordSettings(config));
    case 'telegram':
      return new TelegramProvider(authConfigToTelegramSettings(config));
    case 'email':
      return new EmailProvider(authConfigToEmailSettings(config));
    default:
      return undefined;
  }
};

export class BaseNotification<T extends INotification> {
  protected config: T;

  public logger = logger.child({ label: 'notification.service' });

  constructor(config: T) {
    this.config = config;
  }
}
