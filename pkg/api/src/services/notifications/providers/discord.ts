import { Embeds } from '@/infra/discord/requests/request';
import Embed, { EmbedField } from '@/infra/discord/structure/embed';
import DiscordWebhook from '@/infra/discord/webhook';
import { BaseNotification, INotification } from '../notification';
import { INotify, NotifyEvent, NotifyPayload } from '../notify';
import { AuthConfig } from '../url/url';


export interface DiscordNotification extends INotification {
  id: string;
  token: string;
  thumbnail: boolean;
}

export class DiscordProvider
  extends BaseNotification<DiscordNotification>
  implements INotify
{
  private defaultPrimaryColour = 14129955;

  public async Send(type: NotifyEvent, data: NotifyPayload): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    const { id, token } = this.config;
    await new DiscordWebhook(
      `https://discord.com/api/webhooks/${id}/${token}`,
    ).execute(this.makeEmbed(type, data));
  }

  private makeEmbed(type: NotifyEvent, data: NotifyPayload): Embeds {
    const embed: Embed = {};

    embed.title = data.title;
    embed.description = data.content;
    embed.color = this.defaultPrimaryColour;

    embed.author = {
      name: 'Petio',
      url: 'https://www.petio.tv',
      icon_url: 'https://petio.tv/favicon.png',
    };

    if (data.request) {
      const fields: EmbedField[] = [];

      if (data.user && data.user.username) {
        fields.push({
          name: 'Requested By',
          value: data.user.username,
          inline: true,
        });
      }

      if (data.request)
        fields.push({
          name: 'Requested Date',
          value: data.request.createdAt.toString(),
          inline: true,
        });

      fields.push({
        name: 'Notification Type',
        value: type,
        inline: true,
      });

      if (data.media && data.media.url) {
        fields.push({
          name: 'Media Link',
          value: data.media.url,
        });
      }

      embed.fields = fields;
    }

    if (data.media && data.media.image) {
      if (this.config.thumbnail) {
        embed.thumbnail = {
          url: data.media.image,
        };
      } else {
        embed.image = {
          url: data.media.image,
        };
      }
    }

    return {
      embeds: [embed],
    };
  }
}

export const authConfigToDiscordSettings = (
  url: AuthConfig,
): DiscordNotification => {
  const settings = {} as DiscordNotification;

  if (url.arguments.source) {
    settings.id = url.arguments.source;
  }

  if (url.arguments.value) {
    settings.token = url.arguments.value;
  }

  if (url.options.thumbnail !== undefined) {
    settings.thumbnail = true;
  }

  return settings;
};
