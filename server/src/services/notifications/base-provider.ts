import { NotificationProps } from '@/resources/notification/types';
import { NotifyEvent, NotifyPayload } from '@/services/notifications/types';

/**
 * Represents a base provider for sending notifications.
 */
export abstract class BaseNotificationProvider<T extends NotificationProps> {
  constructor(protected notification: T) {}

  /**
   * Checks if the provider is enabled.
   * @returns A boolean indicating whether the provider is enabled or not.
   */
  isEnabled(): boolean {
    return this.notification.enabled;
  }

  /**
   * Sends a notification of a specific type with the provided data.
   * @param type - The type of the notification.
   * @param data - The payload data for the notification.
   * @returns A promise that resolves when the notification is sent successfully.
   */
  abstract sendNotification(
    type: NotifyEvent,
    data: NotifyPayload,
  ): Promise<void>;
}
