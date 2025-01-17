const axios = require("axios");
const Request = require("../models/request");
const fs = require("fs");
const path = require("path");
const logger = require("../util/logger");

class Radarr {
  constructor(id = false, forced = false, profileOvr = false, pathOvr = false) {
    let project_folder, configFile;
    if (process.pkg) {
      project_folder = path.dirname(process.execPath);
      configFile = path.join(project_folder, "./config/radarr.json");
    } else {
      project_folder = __dirname;
      configFile = path.join(project_folder, "../config/radarr.json");
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
      throw 'no hostname';
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
    let url = `${this.config.protocol}://${this.config.hostname}${this.config.port ? ":" + this.config.port : ""
      }${this.config.urlBase}/api/v3/${endpoint}${paramsString}`;
    try {
      if (method === "post" && body) {
        let res = await axios.post(url, body);
        if (typeof res.data !== 'object') {
          throw "not a valid object";
        }
        return res.data;
      } else {
        let res = await axios.get(url);
        if (typeof res.data !== 'object') {
          throw "not a valid object";
        }
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
      logger.log("verbose", "SERVICE - RADARR: Radarr not enabled");
      return false;
    }
    try {
      let check = await this.get("system/status");
      if (check.error) {
        logger.log(
          "warn",
          `SERVICE - RADARR: [${this.config.title}] ERR Connection failed`
        );
        return false;
      }
      if (check) {
        return check;
      } else {
        logger.log(
          "warn",
          `SERVICE - RADARR: [${this.config.title}] ERR Connection failed`
        );
        return false;
      }
    } catch (err) {
      logger.log(
        "warn",
        `SERVICE - RADARR: [${this.config.title}] ERR Connection failed`
      );
      return false;
    }
  }

  async getPaths() {
    return await this.get("rootfolder");
  }

  async getProfiles() {
    return await this.get("qualityProfile");
  }

  async getTags() {
    return await this.get("tag");
  }

  lookup(id) {
    return this.get("movie/lookup", {
      term: `tmdb:${id}`,
    });
  }

  async refresh() {
    return await this.post("command", false, {
      name: "RefreshMonitoredDownloads",
    });
  }

  async movie(id) {
    const active = await this.connect();
    if (!active) {
      return false;
    }
    try {
      return this.get(`movie/${id}`);
    } catch {
      return false;
    }
  }

  async remove(id) {
    const active = await this.connect();
    if (!active) {
      return false;
    }
    try {
      return this.delete(`movie/${id}`);
    } catch {
      logger.warn("RADARR: Unable to remove job, likely already removed");
    }
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
          ...queue[this.config.uuid].records,
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

  async add(movieData, path = false, profile = false, tag = false) {
    movieData.qualityProfileId = parseInt(
      profile ? profile : this.config.profile
    );
    movieData.rootFolderPath = `${path ? path : this.config.path_title}`;
    movieData.addOptions = {
      searchForMovie: true,
    };
    movieData.monitored = true;
    if (tag) movieData.tags = [parseInt(tag)];

    try {
      let add = await this.post("movie", false, movieData);

      if (Array.isArray(add)) {
        if (add[1].errorMessage) throw add[1].errorMessage;
      }
      return add.id;
    } catch (err) {
      logger.log(
        "warn",
        `SERVICE - RADARR: [${this.config.title}] Unable to add movie`
      );
      logger.log({ level: "error", message: err });
      throw err;
    }
  }

  async processJobs(jobQ) {
    for (let job of jobQ) {
      // Target server
      if (this.config) {
        try {
          let radarrData = await this.lookup(job.tmdb_id);
          let radarrId = false;
          if (radarrData[0].id) {
            logger.log(
              "warn",
              `SERVICE - RADARR: [${this.config.title}] Job skipped already found for ${job.title}`
            );
            radarrId = radarrData[0].id;
          } else {
            radarrId = await this.add(radarrData[0]);
            logger.log(
              "info",
              `SERVICE - RADARR: [${this.config.title}] Radarr job added for ${job.title}`
            );
          }
          await Request.findOneAndUpdate(
            {
              requestId: job.requestId,
            },
            { $push: { radarrId: { [this.config.uuid]: radarrId } } },
            { useFindAndModify: false }
          );
        } catch (err) {
          logger.log(
            "warn",
            `SERVICE - RADARR: [${this.config.title}] Unable to add movie ${job.title}`
          );
          logger.log({ level: "error", message: err });
        }
      } else {
        // Loop for all servers default
        for (let server of this.fullConfig) {
          if (!server.active) {
            logger.log(
              "warn",
              `SERVICE - RADARR: [${server.title}] Server not active`
            );
            return;
          }

          this.config = server;
          try {
            let radarrData = await this.lookup(job.tmdb_id);
            let radarrId = false;
            if (radarrData[0].id) {
              logger.log(
                "warn",
                `SERVICE - RADARR: [${this.config.title}] Job skipped already found for ${job.title}`
              );
              radarrId = radarrData[0].id;
            } else {
              radarrId = await this.add(radarrData[0]);
              logger.log(
                "info",
                `SERVICE - RADARR: [${this.config.title}] Radarr job added for ${job.title}`
              );
            }

            await Request.findOneAndUpdate(
              {
                requestId: job.requestId,
              },
              { $push: { radarrId: { [this.config.uuid]: radarrId } } },
              { useFindAndModify: false }
            );
          } catch (err) {
            logger.log(
              "warn",
              `SERVICE - RADARR: [${this.config.title}] Unable to add movie ${job.title}`
            );
            logger.log({ level: "error", message: err });
          }
        }
      }
    }
  }

  async manualAdd(job, manual) {
    if (this.config) {
      try {
        let radarrData = await this.lookup(job.id);
        let radarrId = false;
        if (radarrData[0] && radarrData[0].id) {
          logger.log(
            "warn",
            `SERVICE - RADARR: [${this.config.title}] Job skipped already found for ${job.title}`
          );
          radarrId = radarrData[0].id;
        } else {
          radarrId = await this.add(
            radarrData[0],
            manual.path,
            manual.profile,
            manual.tag
          );
          logger.log(
            "info",
            `SERVICE - RADARR: [${this.config.title}] Radarr job added for ${job.title}`
          );
        }
        await Request.findOneAndUpdate(
          {
            requestId: job.id,
          },
          { $push: { radarrId: { [this.config.uuid]: radarrId } } },
          { useFindAndModify: false }
        );
      } catch (err) {
        logger.log(
          "warn",
          `SERVICE - RADARR: [${this.config.title}] Unable to add movie ${job.title}`
        );
        logger.log({ level: "error", message: err });
      }
    }
  }

  async processRequest(id) {
    logger.log("info", `SERVICE - RADARR: Processing request`);
    if (!this.fullConfig || this.fullConfig.length === 0) {
      logger.log("warn", `SERVICE - RADARR: No active servers`);
      return;
    }

    const req = await Request.findOne({ requestId: id });
    if (req.type === "movie") {
      if (!req.tmdb_id) {
        logger.log(
          "warn",
          `SERVICE - RADARR: TMDB ID not found for ${req.title}`
        );
      } else if (req.radarrId.length === 0) {
        if (!req.approved) {
          logger.log(
            "warn",
            `SERVICE - RADARR: Request requires approval - ${req.title}`
          );
        } else {
          logger.log("info", "SERVICE - RADARR: Request passed to queue");
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
          logger.log("error", "RADARR: Calendar error");
          logger.log({ level: "error", message: err });
        }
      }
    }

    logger.log("verbose", "RADARR: Calendar returned");

    return mainCalendar;
  }
}

module.exports = Radarr;
