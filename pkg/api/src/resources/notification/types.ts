/**
 * Represents the type of notification.
 */
export enum NotificationType {
  EMAIL = 'email',
  DISCORD = 'discord',
  TELEGRAM = 'telegram',
}

/**
 * Represents the properties of a notification.
 */
export type NotificationProps = {
  name: string;
  url: string;
  type: NotificationType;
  metadata: Record<string, unknown>;
  enabled: boolean;
};

/**
 * Represents the properties for creating a notification.
 */
export type CreateNotificationProps = NotificationProps;
