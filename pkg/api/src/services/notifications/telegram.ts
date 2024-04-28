import axios from 'axios';

import { config } from '@/config/index';
import logger from '@/infra/logger/logger';

export default class Telegram {
  botToken: any;

  chatId: any;

  sendSilently: any;

  constructor() {
    this.botToken = config.get('notifications.telegram.token') || null;
    this.chatId = config.get('notifications.telegram.id') || null;
    this.sendSilently = config.get('notifications.telegram.silent') || false;
  }

  check() {
    if (!this.botToken || !this.chatId) return false;
    return true;
  }

  buildText(content = null, data: any = null) {
    let text = `${content}`;

    if (data) {
      text = `<b>${data.title}</b>\n${data.content}\nRequested by *${data.username}*`;
    }
    return text;
  }

  async test() {
    if (!this.check()) {
      logger.debug('Telegram: Chat id or bot token missing', {
        module: 'notifications.telegram',
      });
      return {
        result: false,
        error: 'Chat id or bot token missing',
      };
    }
    logger.debug('Telegram: Sending test message', {
      module: 'notifications.telegram',
    });
    const defaultText: any = 'Petio Test';
    const text = this.buildText(defaultText);
    const test = await this.postMessage(text);
    if (!test) {
      logger.debug('Telegram: Test Failed', {
        module: 'notifications.telegram',
      });
      return {
        result: false,
        error: 'Failed to send message',
      };
    }
    logger.debug('Telegram: Test passed', {
      module: 'notifications.telegram',
    });
    return {
      result: true,
      error: false,
    };
  }

  send(title = null, content = null, username = null, image = null) {
    if (!this.check()) {
      logger.debug('Telegram: No config defined', {
        module: 'notifications.telegram',
      });
      return {
        result: false,
        error: 'No config found',
      };
    }
    logger.debug(`Telegram: Sending message - ${content}`, {
      module: 'notifications.telegram',
    });
    const text = this.buildText(null, {
      title,
      content,
      username,
      image,
    });
    this.postMessage(text);
  }

  async postMessage(text) {
    try {
      const params = new URLSearchParams();
      params.append('chat_id', this.chatId);
      params.append('text', text);
      params.append('parse_mode', 'HTML');
      if (this.sendSilently) {
        params.append('disable_notification', 'true');
      }

      await axios.get(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          params,
        },
      );
      logger.debug('Telegram: message sent', {
        module: 'notifications.telegram',
      });
      return true;
    } catch (err) {
      logger.debug('Telegram: Failed to send message', {
        module: 'notifications.telegram',
      });
      return false;
    }
  }
}
