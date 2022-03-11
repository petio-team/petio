import axios from "axios";

import logger from "../app/logger";
import { conf } from "../app/config";

export default class Discord {
  webhook: any;
  constructor() {
    this.webhook = conf.get("notifications.discord.url") || false;
  }

  check() {
    if (!this.webhook) return false;
    return true;
  }

  buildBody(content = null, data: any = null) {
    let body: any = {
      content: content,
      username: "Petio",
      avatar_url: "https://petio.tv/favicon.png",
    };
    if (data) {
      body.embeds = [
        {
          title: data.title,
          description: data.content,
          color: 14129955,
          fields: [
            {
              name: "Requested By",
              value: data.username,
            },
          ],
          footer: {
            text: "Powered by Petio",
            icon_url: "https://petio.tv/favicon.png",
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
      logger.verbose("DSCRD: No Webhook defined", {
        label: "notifications.discord",
      });
      return {
        result: false,
        error: "No webhook found",
      };
    }
    logger.verbose("DSCRD: Sending test webhook", {
      label: "notifications.discord",
    });
    const defaultText: any = "Petio Test";
    let body = this.buildBody(defaultText);
    let test = await this.postHook(this.webhook, body);
    if (!test) {
      logger.verbose("DSCRD: Test Failed", { label: "notifications.discord" });
      return {
        result: false,
        error: "Failed to send webhook",
      };
    }
    logger.verbose("DSCRD: Test passed", { label: "notifications.discord" });
    return {
      result: true,
      error: false,
    };
  }

  send(title = null, content = null, username = null, image = null) {
    if (!this.check()) {
      logger.verbose("DSCRD: No Webhook defined", {
        label: "notifications.discord",
      });
      return {
        result: false,
        error: "No webhook found",
      };
    }
    logger.verbose(`DSCRD: Sending webhook - ${content}`, {
      label: "notifications.discord",
    });
    let body = this.buildBody(null, {
      title: title,
      content: content,
      username: username,
      image: image,
    });
    this.postHook(this.webhook, body);
  }

  async postHook(url, body) {
    try {
      await axios({ method: "post", url: url, data: body });
      logger.verbose("DSCRD: Webhook fired", {
        label: "notifications.discord",
      });
      return true;
    } catch (err) {
      logger.error(err, { label: "notifications.discord" });
      logger.verbose("DSCRD: Failed to send webhook", {
        label: "notifications.discord",
      });
      return false;
    }
  }
}
