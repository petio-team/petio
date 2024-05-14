import { Override } from '@/infrastructure/utils/override';

/**
 * Represents the type of notification.
 */
export enum NotificationType {
  SMTP = 'smtp',
  DISCORD = 'discord',
  TELEGRAM = 'telegram',
}

/**
 * Represents the properties of a notification.
 */
export type NotificationProps = {
  name: string;
  type: NotificationType;
  metadata: Record<string, unknown>;
  enabled: boolean;
};

/**
 * Represents the properties for creating a notification.
 */
export type CreateNotificationProps = Override<
  NotificationProps,
  {
    //  TODO: add additional fields
  }
>;

/**
 * Represents a Discord notification.
 * @template T - The type of the notification properties.
 */
export type DiscordNotificationProps = Override<
  NotificationProps,
  {
    type: NotificationType.DISCORD;
    metadata: {
      id: string;
      token: string;
      useThumbnail?: boolean;
      useFooter?: boolean;
    };
  }
>;

/**
 * Represents the properties for an SMTP notification.
 */
export type SMTPNotificationProps = Override<
  NotificationProps,
  {
    type: NotificationType.SMTP;
    metadata: {
      host: string;
      port: number;
      username: string;
      password: string;
      from: string;
      secure: boolean;
    };
  }
>;

/**
 * Represents the properties for a Telegram notification.
 */
export type TelegramNotificationProps = Override<
  NotificationProps,
  {
    type: NotificationType.TELEGRAM;
    metadata: {
      botId: string;
      chatId: string;
      isSilent: boolean;
    };
  }
>;
