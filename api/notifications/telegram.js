const fs = require("fs");
const path = require("path");
const axios = require("axios");
const logger = require("../util/logger");

class Telegram {
  constructor() {
    let project_folder, configFile, mconfigFile;
    if (process.pkg) {
      project_folder = path.dirname(process.execPath);
      configFile = path.join(project_folder, "./config/config.json");
    } else {
      project_folder = __dirname;
      configFile = path.join(project_folder, "../config/config.json");
    }
    const configData = fs.readFileSync(configFile);
    const configParse = JSON.parse(configData);
    this.config = configParse;
    this.botToken = configParse.telegram_bot_token || null;
    this.chatId = configParse.telegram_chat_id || null;
  }

  check() {
    if (!this.botToken || !this.chatId) return false;
    return true;
  }

  buildText(content = null, data = null) {
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
    let text = this.buildText("Petio Test");
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
      console.log(text);
      params.append("chat_id", this.chatId);
      params.append("text", text);
      params.append("parse_mode", "HTML");

      await axios.get(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          params,
        }
      );
      logger.info("Telegram: message sent");
      return true;
    } catch (err) {
      console.log(err);
      logger.warn("Telegram: Failed to send message");
      return false;
    }
  }
}

module.exports = Telegram;
