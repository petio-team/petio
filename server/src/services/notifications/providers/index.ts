import { NotificationEntity } from '@/resources/notification/entity';
import { NotificationType } from '@/resources/notification/types';
import { BaseNotificationProvider } from '@/services/notifications/base-provider';
import { DiscordNotificationProvider } from '@/services/notifications/providers/discord/discord';
import { SMTPNotificationProvider } from '@/services/notifications/providers/smtp/smtp';
import { TelegramNotificationProvider } from '@/services/notifications/providers/telegram/telegram';

/**
 * Represents a mapping of notification types to their respective providers and validators.
 */
export type NotificationProvider = {
  [x in NotificationType]: {
    provider: typeof BaseNotificationProvider<any>;
    validator: (entity: NotificationEntity) => boolean;
  };
};

/**
 * Object containing notification providers.
 * Each provider is associated with a notification type and includes a provider class and a validator function.
 */
export const providers: NotificationProvider = {
  [NotificationType.DISCORD]: {
    provider: DiscordNotificationProvider,
    validator: (entity: NotificationEntity) => entity.isDiscordNotification(),
  },
  [NotificationType.SMTP]: {
    provider: SMTPNotificationProvider,
    validator: (entity: NotificationEntity) => entity.isSMTPNotification(),
  },
  [NotificationType.TELEGRAM]: {
    provider: TelegramNotificationProvider,
    validator: (entity: NotificationEntity) => entity.isTelegramNotification(),
  },
};
