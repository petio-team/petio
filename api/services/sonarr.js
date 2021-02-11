const request = require("xhr-request");
const Request = require("../models/request");
const fs = require("fs");
const path = require("path");
var sanitize = require("sanitize-filename");
const logger = require("../util/logger");

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

  process(method, endpoint, params, body = false) {
    return new Promise((resolve, reject) => {
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
      let args = {
        method: method,
        json: true,
      };
      if (method === "post" && body) {
        args = {
          method: method,
          json: true,
          body: body,
        };
      }
      request(url, args, function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
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
      logger.log("warn", "SERVICE - SONARR: Sonarr not enabled");
      return false;
    }
    try {
      let check = await this.get("system/status");
      if (check.error) {
        logger.log("warn", "SERVICE - SONARR: ERR Connection failed");
        return false;
      }
      if (check) {
        return true;
      } else {
        logger.log("warn", "SERVICE - SONARR: ERR Connection failed");
        return false;
      }
    } catch (err) {
      logger.log("warn", "SERVICE - SONARR: ERR Connection failed");
      return false;
    }
  }

  async getPaths() {
    return await this.get("rootfolder");
  }

  async getProfiles() {
    return await this.get("profile");
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
    let queue = [];
    for (let i = 0; i < this.fullConfig.length; i++) {
      this.config = this.fullConfig[i];
      const active = await this.connect();
      if (!active) {
        return false;
      }
      // await this.refresh();
      queue[i] = await this.get(`queue`);
      queue[i]["serverName"] = this.config.title;
    }
    return queue;
  }

  async test() {
    return await this.connect(true);
  }

  async add(seriesData) {
    seriesData.ProfileId = this.config.profile;
    seriesData.seasonFolder = true;
    seriesData.Path = `${this.config.path_title}${sanitize(
      seriesData.title
    )} (${seriesData.year})`;
    seriesData.addOptions = {
      searchForMissingEpisodes: true,
    };

    try {
      let add = await this.post("series", false, seriesData);
      return add.id;
    } catch (err) {
      logger.error(err.stack);
      logger.log("error", `SERVICE - SONARR: Unable to add series`);
      logger.error(err.stack);
      return false;
    }
  }

  async processJobs(jobQ) {
    for (let job of jobQ) {
      if (this.config) {
        try {
          let sonarrData = await this.lookup(job.tvdb_id);
          let sonarrId = await this.add(sonarrData[0]);
          let updatedRequest = await Request.findOneAndUpdate(
            {
              requestId: job.requestId,
            },
            { $push: { sonarrId: { [this.config.uuid]: sonarrId } } },
            { useFindAndModify: false }
          );
          if (updatedRequest) {
            logger.log(
              "info",
              `SERVICE - SONARR: [${this.config.title}] Sonnar job added for ${job.title}`
            );
          }
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
            let sonarrId = await this.add(sonarrData[0]);
            let updatedRequest = await Request.findOneAndUpdate(
              {
                requestId: job.requestId,
              },
              { $push: { sonarrId: { [this.config.uuid]: sonarrId } } },
              { useFindAndModify: false }
            );
            if (updatedRequest) {
              logger.log(
                "info",
                `SERVICE - SONARR: [${this.config.title}] Sonnar job added for ${job.title}`
              );
            }
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
          logger.error(err.stack);
        }
      }
    }

    logger.log("verbose", "SONARR: Calendar returned");

    return mainCalendar;
  }
}

module.exports = Sonarr;
