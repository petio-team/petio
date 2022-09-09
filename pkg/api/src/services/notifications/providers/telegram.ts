import TelegramAPI from '@/infra/telegram/api';

import { BaseNotification, INotification } from '../notification';
import { INotify, NotifyEvent, NotifyPayload } from '../notify';
import { AuthConfig } from '../url/url';

export interface TelegramNotification extends INotification {
  chatId: string;
  botToken: string;
  silent: boolean;
}

export class TelegramProvider
  extends BaseNotification<TelegramNotification>
  implements INotify
{
  protected client: TelegramAPI;

  constructor(config: TelegramNotification) {
    super(config);
    this.client = new TelegramAPI(this.config.botToken);
  }

  public async Send(type: NotifyEvent, data: NotifyPayload): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    this.client.execute({
      chat_id: this.config.chatId,
      disable_notification: this.config.silent,
      text: this.makeOutput(type, data),
    });
  }

  private makeOutput(type: NotifyEvent, data: NotifyPayload): string {
    let output = '';

    output += `<b>` + type + `</b>\n\n`;

    if (data.title) {
      output += `<b>` + data.title + `</b>\n`;
    }

    if (data.content) {
      output += data.content + '\n';
    }

    if (data.request) {
      if (data.user) {
        output += `Requested By: *${data.user.username}*\n`;
      }
      output += `Requested Date: *${data.request.createdAt}*\n`;
    }

    if (data.media && data.media.url) {
      output += `Media Link: ${data.media.url}`;
    }

    return output;
  }
}

export const authConfigToTelegramSettings = (
  url: AuthConfig,
): TelegramNotification => {
  const settings = {} as TelegramNotification;

  if (url.arguments.source) {
    settings.botToken = url.arguments.source;
  }

  if (url.arguments.value) {
    settings.botToken = url.arguments.value;
  }

  if (url.options['silent'] !== undefined) {
    settings.silent = true;
  }

  return settings;
};

// https://stackoverflow.com/questions/60130062/escaped-character-on-telegram-bot-api-4-5-markdownv2-gives-trouble-for-hyper-lin
// TODO: for use when we support markdown
// private escapeText(text: string): string {
//   return text.replace(
//     /\[([^\][]*)]\(/g,
//     (_x, y) => '[' + y.replace(/[-.+?^$[\](){}\\!#]/g, '\\$&') + '](',
//   );
// }
