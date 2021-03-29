const Request = require("../models/request");
const fs = require("fs");
const path = require("path");
var sanitize = require("sanitize-filename");
const logger = require("../util/logger");
const axios = require("axios");

class Sonarr {
  constructor(id = false, forced = false, profileOvr = false, pathOvr = false) {
    let project_folder, configFile;
    if (process.pkg) {
      project_folder = path.dirname(process.execPath);
      configFile = path.join(project_folder, "./config/sonarr.json");
    } else {
      project_folder = __dirname;
      configFile = path.join(project_folder, "../config/sonarr.json");
    }
    const configData = fs.readFileSync(configFile);
    const configParse = JSON.parse(configData);
    this.fullConfig = configParse;
    this.forced = forced;
    if (id !== false) {
      this.config = this.findUuid(id, configParse);
      if (profileOvr) this.config.profile = profileOvr;
      if (pathOvr) this.config.path_title = pathOvr;

      if (!this.config) {
        this.config = {};
        this.config.title = "Server Removed";
      }
    }
  }

  findUuid(uuid, config) {
    for (var i = 0; i < config.length; i++) {
      if (config[i].uuid === uuid) {
        return config[i];
      }
    }
  }

  async process(method, endpoint, params, body = false) {
    if (!this.config.hostname) {
      reject("");
      return;
    }
    if (!params) {
      params = {};
    }
    params.apikey = this.config.apiKey;
    let paramsString = "";
    Object.keys(params).map((val, i) => {
      let key = val;
      paramsString += `${i === 0 ? "?" : "&"}${key}=${params[val]}`;
    });
    let url = `${this.config.protocol}://${this.config.hostname}${
      this.config.port ? ":" + this.config.port : ""
    }${this.config.urlBase}/api/${endpoint}${paramsString}`;
    try {
      if (method === "post" && body) {
        let res = await axios.post(url, body);
        return res.data;
      } else {
        let res = await axios.get(url);
        return res.data;
      }
    } catch (err) {
      throw err;
    }
  }

  getConfig() {
    return this.fullConfig;
  }

  async get(endpoint, params = false) {
    return this.process("get", endpoint, params);
  }

  async delete(endpoint, params = false) {
    return this.process("delete", endpoint, params);
  }

  async post(endpoint, params = false, body = {}) {
    return this.process("post", endpoint, params, body);
  }

  async connect(test = false) {
    if (!this.config || this.config.title == "Server Removed") {
      return false;
    }
    if (!this.config.active && !test) {
      logger.log(
        "warn",
        `SERVICE - SONARR: [${this.config.title}] Sonarr not enabled`
      );
      return false;
    }
    try {
      let check = await this.get("system/status");
      if (check.error) {
        logger.log(
          "warn",
          `SERVICE - SONARR: [${this.config.title}] ERR Connection failed`
        );
        return false;
      }
      if (check) {
        return true;
      } else {
        logger.log(
          "warn",
          `SERVICE - SONARR: [${this.config.title}] ERR Connection failed`
        );
        return false;
      }
    } catch (err) {
      logger.log(
        "warn",
        `SERVICE - SONARR: [${this.config.title}] ERR Connection failed`
      );
      return false;
    }
  }

  async getPaths() {
    return await this.get("rootfolder");
  }

  async getProfiles() {
    return await this.get("profile");
  }

  async getTags() {
    return await this.get("tag");
  }

  lookup(id) {
    return this.get("series/lookup", {
      term: `tvdb:${id}`,
    });
  }

  async series(id) {
    const active = await this.connect();
    if (!active) {
      return false;
    }
    return this.get(`series/${id}`);
  }

  async remove(id) {
    const active = await this.connect();
    if (!active) {
      return false;
    }
    return this.delete(`series/${id}`);
  }

  async queue() {
    let queue = {};
    for (let i = 0; i < this.fullConfig.length; i++) {
      this.config = this.fullConfig[i];
      const active = await this.connect();
      if (!active) {
        return false;
      }
      // await this.refresh();
      queue[this.config.uuid] = await this.get(`queue`);
      let totalRecords = queue[this.config.uuid].totalRecords;
      let pageSize = queue[this.config.uuid].pageSize;
      let pages = Math.ceil(totalRecords / pageSize);
      for (let p = 2; p <= pages; p++) {
        let queuePage = await this.get("queue", {
          page: p,
        });
        queue[this.config.uuid].records = [
          ...queue[i].records,
          ...queuePage.records,
        ];
      }
      queue[this.config.uuid]["serverName"] = this.config.title;
    }
    return queue;
  }

  async test() {
    return await this.connect(true);
  }

  async add(
    seriesData,
    path = false,
    profile = false,
    type = "standard",
    tag = false
  ) {
    seriesData.qualityProfileId = profile ? profile : this.config.profile;
    seriesData.seasonFolder = true;
    seriesData.rootFolderPath = `${path ? path : this.config.path_title}`;
    seriesData.addOptions = {
      searchForMissingEpisodes: true,
    };
    if (type) seriesData.seriesType = type;
    if (tag) seriesData.tags = [parseInt(tag)];

    try {
      let add = await this.post("series", false, seriesData);
      if (!add.id) throw add.message;
      return add.id;
    } catch (err) {
      console.log(err);
      logger.log({ level: "error", message: err });
      logger.log(
        "error",
        `SERVICE - SONARR: [${this.config.title}] Unable to add series`
      );
      logger.log({ level: "error", message: err });
      return false;
    }
  }

  async processJobs(jobQ) {
    for (let job of jobQ) {
      if (this.config) {
        try {
          let sonarrData = await this.lookup(job.tvdb_id);
          let sonarrId = false;
          if (sonarrData[0].id) {
            logger.log(
              "warn",
              `SERVICE - SONARR: [${this.config.title}] Job skipped already found for ${job.title}`
            );
            sonarrId = sonarrData[0].id;
          } else {
            sonarrId = await this.add(sonarrData[0]);
            logger.log(
              "info",
              `SERVICE - SONARR: [${this.config.title}] Sonnar job added for ${job.title}`
            );
          }

          await Request.findOneAndUpdate(
            {
              requestId: job.requestId,
            },
            { $push: { sonarrId: { [this.config.uuid]: sonarrId } } },
            { useFindAndModify: false }
          );
        } catch (err) {
          logger.log("info", err);
          logger.log(
            "warn",
            `SERVICE - SONARR: [${this.config.title}] Unable to add series ${job.title}`
          );
        }
      } else {
        for (let server of this.fullConfig) {
          if (!server.active) {
            return;
          }

          this.config = server;
          try {
            let sonarrData = await this.lookup(job.tvdb_id);
            let sonarrId = false;
            if (sonarrData[0].id) {
              logger.log(
                "warn",
                `SERVICE - SONARR: [${this.config.title}] Job skipped already found for ${job.title}`
              );
              sonarrId = sonarrData[0].id;
            } else {
              sonarrId = await this.add(sonarrData[0]);
              logger.log(
                "info",
                `SERVICE - SONARR: [${this.config.title}] Sonnar job added for ${job.title}`
              );
            }

            await Request.findOneAndUpdate(
              {
                requestId: job.requestId,
              },
              { $push: { sonarrId: { [this.config.uuid]: sonarrId } } },
              { useFindAndModify: false }
            );
          } catch (err) {
            logger.log("info", err);
            logger.log(
              "warn",
              `SERVICE - SONARR: [${this.config.title}] Unable to add series ${job.title}`
            );
          }
        }
      }
    }
  }

  async manualAdd(job, manual) {
    if (this.config) {
      try {
        let sonarrData = await this.lookup(job.tvdb_id);
        let sonarrId = false;
        if (sonarrData[0] && sonarrData[0].id) {
          logger.log(
            "warn",
            `SERVICE - SONARR: [${this.config.title}] Job skipped already found for ${job.title}`
          );
          sonarrId = sonarrData[0].id;
        } else {
          console.log(manual.type);
          sonarrId = await this.add(
            sonarrData[0],
            manual.path,
            manual.profile,
            manual.type,
            manual.tag
          );
          logger.log(
            "info",
            `SERVICE - SONARR: [${this.config.title}] Sonnar job added for ${job.title}`
          );
        }
        await Request.findOneAndUpdate(
          {
            requestId: job.id,
          },
          { $push: { sonarrId: { [this.config.uuid]: sonarrId } } },
          { useFindAndModify: false }
        );
      } catch (err) {
        console.log(err);
        logger.log({ level: "error", message: err });
        logger.log(
          "warn",
          `SERVICE - SONARR: [${this.config.title}] Unable to add series ${job.title}`
        );
      }
    }
  }

  async processRequest(id) {
    logger.log("info", `SERVICE - SONARR: Processing request`);
    if (!this.fullConfig || this.fullConfig.length === 0) {
      logger.log("info", `SERVICE - SONARR: No active servers`);
      return;
    }

    const req = await Request.findOne({ requestId: id });
    if (req.type === "tv") {
      if (!req.tvdb_id) {
        logger.log(
          "warn",
          `SERVICE - SONARR: TVDB ID not found for ${req.title}`
        );
      } else if (req.sonarrId.length === 0 || this.forced) {
        if (!req.approved) {
          logger.log(
            "warn",
            `SERVICE - SONARR: Request requires approval - ${req.title}`
          );
        } else {
          logger.log("info", "SERVICE - SONARR: Request passed to queue");
          this.processJobs([req]);
        }
      }
    }
  }

  async calendar() {
    let mainCalendar = [];
    let now = new Date();
    for (let server of this.fullConfig) {
      if (server.active) {
        this.config = server;

        try {
          let serverCal = await this.get("/calendar", {
            unmonitored: true,
            start: new Date(
              now.getFullYear(),
              now.getMonth() - 1,
              1
            ).toISOString(),
            end: new Date(
              now.getFullYear(),
              now.getMonth() + 2,
              1
            ).toISOString(),
          });
          mainCalendar = [...mainCalendar, ...serverCal];
        } catch (err) {
          logger.log("error", "SONARR: Calendar error");
          logger.log({ level: "error", message: err });
        }
      }
    }

    logger.log("verbose", "SONARR: Calendar returned");

    return mainCalendar;
  }
}

module.exports = Sonarr;
