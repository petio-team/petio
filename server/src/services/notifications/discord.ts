import axios from 'axios';

import loggerMain from '@/infrastructure/logger/logger';

const logger = loggerMain.child({ module: 'notifications.discord' });

export default class Discord {
  webhook: any;

  constructor() {
    this.webhook = false;
  }

  check() {
    if (!this.webhook) return false;
    return true;
  }

  buildBody(content = null, data: any = null) {
    const body: any = {
      content,
      username: 'Petio',
      avatar_url: 'https://petio.tv/favicon.png',
    };
    if (data) {
      body.embeds = [
        {
          title: data.title,
          description: data.content,
          color: 14129955,
          fields: [
            {
              name: 'Requested By',
              value: data.username,
            },
          ],
          footer: {
            text: 'Powered by Petio',
            icon_url: 'https://petio.tv/favicon.png',
          },
          thumbnail: {
            url: data.image,
          },
        },
      ];
    }

    return body;
  }

  async test() {
    if (!this.check()) {
      logger.debug('DSCRD: No Webhook defined');
      return {
        result: false,
        error: 'No webhook found',
      };
    }
    logger.debug('DSCRD: Sending test webhook');
    const defaultText: any = 'Petio Test';
    const body = this.buildBody(defaultText);
    const test = await this.postHook(this.webhook, body);
    if (!test) {
      logger.debug('DSCRD: Test Failed');
      return {
        result: false,
        error: 'Failed to send webhook',
      };
    }
    logger.debug('DSCRD: Test passed');
    return {
      result: true,
      error: false,
    };
  }

  send(title = null, content = null, username = null, image = null) {
    if (!this.check()) {
      logger.debug('DSCRD: No Webhook defined');
      return {
        result: false,
        error: 'No webhook found',
      };
    }
    logger.debug(`DSCRD: Sending webhook - ${content}`);
    const body = this.buildBody(null, {
      title,
      content,
      username,
      image,
    });
    this.postHook(this.webhook, body);
  }

  async postHook(url, body) {
    try {
      await axios({ method: 'post', url, data: body });
      logger.debug('DSCRD: Webhook fired');
      return true;
    } catch (err) {
      logger.error(`DSCRD: Failed to send webhook`, err);
      return false;
    }
  }
}
