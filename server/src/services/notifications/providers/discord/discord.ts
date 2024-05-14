import {
  DiscordAPIClient,
  RichEmbed,
  RichEmbedField,
} from '@/infrastructure/discord';
import { DiscordNotificationProps } from '@/resources/notification/types';
import { BaseNotificationProvider } from '@/services/notifications/base-provider';
import { NotifyEvent, NotifyPayload } from '@/services/notifications/types';

const CommonProps = {
  defaultEmbedColour: 14129955,
};

export class DiscordNotificationProvider extends BaseNotificationProvider<DiscordNotificationProps> {
  private client: DiscordAPIClient;

  constructor(notification: DiscordNotificationProps) {
    super(notification);
    this.client = new DiscordAPIClient();
  }

  private buildFields(
    type: NotifyEvent,
    payload: NotifyPayload,
  ): RichEmbedField[] {
    const fields: RichEmbedField[] = [];
    switch (type) {
      case NotifyEvent.REQUEST_ADDED:
      case NotifyEvent.REQUEST_REMOVED:
      case NotifyEvent.REQUEST_APPROVED:
      case NotifyEvent.REQUEST_REJECTED:
      case NotifyEvent.REQUEST_FAILED:
      case NotifyEvent.REQUEST_COMPLETED:
      case NotifyEvent.REQUEST_PENDING: {
        fields.push({
          name: 'Requested By',
          value:
            payload.user?.title || payload.user?.username || 'Unknown User',
        });
        break;
      }
      default: {
        break;
      }
    }

    return fields;
  }

  public async sendNotification(
    type: NotifyEvent,
    payload: NotifyPayload,
  ): Promise<void> {
    const { useFooter, useThumbnail } = this.notification.metadata;
    const embed: RichEmbed = {};
    embed.title = payload.title;
    embed.description = payload.description;
    embed.color = CommonProps.defaultEmbedColour;
    embed.fields = this.buildFields(type, payload);
    if (useThumbnail) {
      embed.thumbnail = {
        url: payload.media?.image,
      };
    }
    if (useFooter) {
      embed.footer = {
        text: 'Powered by Petio',
        icon_url: 'https://petio.tv/favicon.png',
      };
    }

    const { id, token } = this.notification.metadata;
    await this.client.default.executeWebhook({
      webhookId: id,
      webhookToken: token,
      requestBody: {
        username: 'Petio',
        avatar_url: 'https://petio.tv/favicon.png',
        content: payload.content,
        embeds: [embed],
      },
    });
  }
}
