import axios from "axios";

import logger from "../app/logger";
import { conf } from "../app/config";

export default class Telegram {
  botToken: any;
  chatId: any;
  sendSilently: any;
  constructor() {
    this.botToken = conf.get('notifications.telegram.token') || null;
    this.chatId = conf.get('notifications.telegram.id') || null;
    this.sendSilently = conf.get('notifications.telegram.silent') || false;
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
      logger.warn("Telegram: Chat id or bot token missing");
      return {
        result: false,
        error: "Chat id or bot token missing",
      };
    }
    logger.info("Telegram: Sending test message");
    const defaultText: any = "Petio Test";
    let text = this.buildText(defaultText);
    let test = await this.postMessage(text);
    if (!test) {
      logger.warn("Telegram: Test Failed");
      return {
        result: false,
        error: "Failed to send message",
      };
    }
    logger.info("Telegram: Test passed");
    return {
      result: true,
      error: false,
    };
  }

  send(title = null, content = null, username = null, image = null) {
    if (!this.check()) {
      logger.warn("Telegram: No config defined");
      return {
        result: false,
        error: "No config found",
      };
    }
    logger.info(`Telegram: Sending message - ${content}`);
    const text = this.buildText(null, {
      title: title,
      content: content,
      username: username,
      image: image,
    });
    this.postMessage(text);
  }

  async postMessage(text) {
    try {
      const params = new URLSearchParams();
      params.append("chat_id", this.chatId);
      params.append("text", text);
      params.append("parse_mode", "HTML");
      if (this.sendSilently) {
        params.append("disable_notification", "true");
      }

      await axios.get(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          params,
        }
      );
      logger.info("Telegram: message sent");
      return true;
    } catch (err) {
      logger.warn("Telegram: Failed to send message");
      return false;
    }
  }
}