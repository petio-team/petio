import { nanoid } from 'nanoid';

import { BaseEntity } from '@/infrastructure/entity/entity';

import {
  CreateNotificationProps,
  DiscordNotificationProps,
  NotificationProps,
  NotificationType,
  SMTPNotificationProps,
  TelegramNotificationProps,
} from './types';

/**
 * Represents a Notification entity.
 */
export class NotificationEntity extends BaseEntity<NotificationProps> {
  /**
   * Creates a new Notification entity.
   * @param create - The properties to create the Notification entity.
   * @returns The newly created Notification entity.
   */
  static create(create: CreateNotificationProps): NotificationEntity {
    const id = nanoid();
    const props: NotificationProps = {
      ...create,
    };
    return new NotificationEntity({ id, props });
  }

  /**
   * Gets the name of the notification entity.
   * @returns The name of the notification entity.
   */
  get name(): string {
    return this.props.name;
  }

  /**
   * Gets the type of the notification.
   * @returns The type of the notification.
   */
  get type(): string {
    return this.props.type;
  }

  /**
   * Gets the metadata of the notification.
   * @returns The metadata of the notification.
   */
  get metadata(): Record<string, unknown> {
    return this.props.metadata;
  }

  /**
   * Gets whether the notification is enabled.
   * @returns Whether the notification is enabled.
   */
  get enabled(): boolean {
    return this.props.enabled;
  }

  /**
   * Checks if a given notification is a Discord notification.
   * @param value - The notification to check.
   * @returns True if the notification is a Discord notification, false otherwise.
   */
  isDiscordNotification(): this is this & {
    props: DiscordNotificationProps;
  } {
    return (
      this.props.type === NotificationType.DISCORD &&
      'id' in this.props.metadata &&
      'token' in this.props.metadata
    );
  }

  /**
   * Checks if a given notification is a Telegram notification.
   * @param value - The notification to check.
   * @returns True if the notification is a Telegram notification, false otherwise.
   */
  isTelegramNotification(): this is this & {
    props: TelegramNotificationProps;
  } {
    return (
      this.props.type === NotificationType.TELEGRAM &&
      'botId' in this.props.metadata &&
      'chatId' in this.props.metadata
    );
  }

  /**
   * Checks if a given notification is a SMTP notification.
   * @param value - The notification to check.
   * @returns True if the notification is a SMTP notification, false otherwise.
   */
  isSMTPNotification(): this is this & {
    props: SMTPNotificationProps;
  } {
    return (
      this.props.type === NotificationType.SMTP &&
      'host' in this.props.metadata &&
      'port' in this.props.metadata &&
      'username' in this.props.metadata &&
      'password' in this.props.metadata
    );
  }

  /**
   * Validates the Notification entity.
   */
  public validate(): void {}
}
