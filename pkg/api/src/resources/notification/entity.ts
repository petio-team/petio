import { nanoid } from 'napi-nanoid';

import { BaseEntity } from '@/infra/entity/entity';

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
   * Validates the Notification entity.
   */
  public validate(): void {}
}
