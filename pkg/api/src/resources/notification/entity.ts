import { nanoid } from 'napi-nanoid';

import { BaseEntity } from '@/infrastructure/entity/entity';

import { CreateNotificationProps, NotificationProps } from './types';

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
   * Gets the URL of the notification.
   * @returns The URL of the notification.
   */
  get url(): string {
    return this.props.url;
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
   * Validates the Notification entity.
   */
  public validate(): void {}
}
