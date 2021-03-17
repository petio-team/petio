const fs = require("fs");
const path = require("path");
const axios = require("axios");
const logger = require("../util/logger");

class Discord {
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
    this.webhook = configParse.discord_webhook || false;
  }

  check() {
    if (!this.webhook) return false;
    return true;
  }

  buildBody(content = null, data = null) {
    let body = {
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
          image: {
            url: data.image,
          },
        },
      ];
    }

    return body;
  }

  async test() {
    if (!this.check()) {
      logger.warn("DSCRD: No Webhook defined");
      return {
        result: false,
        error: "No webhook found",
      };
    }
    logger.info("DSCRD: Sending test webhook");
    let body = this.buildBody("Petio Test");
    let test = await this.postHook(this.webhook, body);
    if (!test) {
      logger.warn("DSCRD: Test Failed");
      return {
        result: false,
        error: "Failed to send webhook",
      };
    }
    logger.info("DSCRD: Test passed");
    return {
      result: true,
      error: false,
    };
  }

  send(title = null, content = null, username = null, image = null) {
    if (!this.check()) {
      logger.warn("DSCRD: No Webhook defined");
      return {
        result: false,
        error: "No webhook found",
      };
    }
    logger.info(`DSCRD: Sending webhook - ${content}`);
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
      logger.info("DSCRD: Webhook fired");
      return true;
    } catch (err) {
      console.log(err);
      logger.warn("DSCRD: Failed to send webhook");
      return false;
    }
  }
}

module.exports = Discord;
