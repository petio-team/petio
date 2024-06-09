import { TelegramV7ApiClient } from '@/infrastructure/generated/telegram-api-client';
import { BaseNotificationProvider } from '@/services/notifications/base-provider';
import { TelegramNotificationProps } from '@/services/notifications/providers/telegram/types';
import { NotifyEvent, NotifyPayload } from '@/services/notifications/types';

export class TelegramNotificationProvider extends BaseNotificationProvider<TelegramNotificationProps> {
  private client: TelegramV7ApiClient;

  constructor(notification: TelegramNotificationProps) {
    super(notification);
    this.client = new TelegramV7ApiClient({
      BASE: `https://api.telegram.org/bot${notification.metadata.botId}`,
    });
  }

  private buildMessage(type: NotifyEvent, data: NotifyPayload) {
    switch (type) {
      case NotifyEvent.REQUEST_ADDED: {
        return `A new request has been added: ${data.title} by ${data.user?.username}`;
      }
      case NotifyEvent.REQUEST_REMOVED: {
        return `A request has been removed: ${data.title} by ${data.user?.username}`;
      }
      case NotifyEvent.REQUEST_APPROVED: {
        return `A request has been approved: ${data.title} by ${data.user?.username}`;
      }
      default: {
        return '';
      }
    }
  }

  async sendNotification(
    type: NotifyEvent,
    data: NotifyPayload,
  ): Promise<void> {
    await this.client.default.postSendMessage({
      requestBody: {
        text: this.buildMessage(type, data),
        chat_id: this.notification.metadata.chatId,
      },
    });
  }
}
