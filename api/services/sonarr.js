const Request = require("../models/request");
const fs = require("fs");
const path = require("path");
const logger = require("../util/logger");
const axios = require("axios");

class Sonarr {
  constructor() {
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
    this.config = false;
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
      } else if (method === "delete") {
        let res = await axios.delete(url);
        return res.data;
      } else if (method === "put" && body) {
        let res = await axios.put(url, body);
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

  async put(endpoint, params = false, body = {}) {
    return this.process("put", endpoint, params, body);
  }

  async connect(test = false) {
    if (!this.config || this.config.title == "Server Removed") {
      return false;
    }
    if (!this.config.active && !test) {
      logger.log(
        "verbose",
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

  async getPaths(serverId) {
    this.config = this.findUuid(serverId, this.fullConfig);
    return await this.get("rootfolder");
  }

  async getProfiles(serverId) {
    this.config = this.findUuid(serverId, this.fullConfig);
    return await this.get("qualityprofile");
  }

  async getTags(serverId) {
    this.config = this.findUuid(serverId, this.fullConfig);
    return await this.get("tag");
  }

  lookup(id) {
    return this.get("series/lookup", {
      term: `tvdb:${id}`,
    });
  }

  async series(server, id) {
    this.config = this.findUuid(server.id, this.fullConfig);
    const active = await this.connect();
    if (!active) {
      return false;
    }
    try {
      return this.get(`series/${id}`);
    } catch {
      return false;
    }
  }

  serverDetails(server) {
    this.config = this.findUuid(server.id, this.fullConfig);
    return this.config;
  }

  async queue() {
    let queue = {};
    for (let i = 0; i < this.fullConfig.length; i++) {
      this.config = this.fullConfig[i];
      const active = await this.connect();
      if (!active) {
        return false;
      }
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

  async test(serverId) {
    this.config = this.findUuid(serverId, this.fullConfig);
    return await this.connect(true);
  }

  async addShow(server, request, filter = false) {
    let sonarrId = false;
    if (!this.fullConfig || this.fullConfig.length === 0) {
      logger.log("info", `SERVICE - SONARR: No active servers`);
      return;
    }
    if (!request.tvdb_id) {
      logger.log(
        "warn",
        `SERVICE - SONARR: TVDB ID not found for ${request.title}`
      );
      return;
    }
    let servers = this.fullConfig;
    if (server) {
      servers = [this.findUuid(server.id, this.fullConfig)];
    }
    for (let i = 0; i < servers.length; i++) {
      this.config = servers[i];
      let lookup = await this.lookup(request.tvdb_id);
      let showData = lookup[0];
      let rSeasons = request.seasons;
      if (rSeasons) {
        for (let s = 0; s < showData.seasons.length; s++) {
          let season = showData.seasons[s];
          season.monitored = rSeasons[season.seasonNumber] ? true : false;
        }
      }
      showData.qualityProfileId =
        filter && filter.profile ? filter.profile : this.config.profile;
      showData.seasonFolder = true;
      showData.rootFolderPath = `${filter && filter.path ? filter.path : this.config.path_title
        }`;
      showData.addOptions = {
        searchForMissingEpisodes: true,
      };
      showData.languageProfileId = 1;
      if (filter && filter.type) showData.seriesType = filter.type;
      if (filter && filter.tag) showData.tags = [parseInt(filter.tag)];

      if (showData.id) {
        sonarrId = showData.id;
        logger.log(
          "info",
          `SERVICE - SONARR: Request exists - Updating ${request.title}`
        );
        try {
          await this.put(`series/${showData.id}`, false, showData);
          logger.log(
            "info",
            `SERVICE - SONARR: [${this.config.title}] Sonnar job updated for ${request.title}`
          );
        } catch (err) {
          console.log(err);
          logger.log(
            "error",
            `SERVICE - SONARR: [${this.config.title}] Unable to update series`
          );
          logger.log({ level: "error", message: err });
          return false;
        }
      } else {
        try {
          let add = await this.post("series", false, showData);
          if (!add.id) throw add.message;
          logger.log(
            "info",
            `SERVICE - SONARR: [${this.config.title}] Sonnar job added for ${request.title}`
          );
          sonarrId = add.id;
        } catch (err) {
          logger.log(
            "error",
            `SERVICE - SONARR: [${this.config.title}] Unable to add series`
          );
          logger.log({ level: "error", message: err });
          return false;
        }
      }
      try {
        let dbRequest = await Request.findOne({
          requestId: request.id,
        });
        let exists = false;
        for (let o; o < dbRequest.sonarrId.lenght; o++) {
          if (dbRequest.sonarrId[o][this.config.uuid]) {
            exists = true;
            dbRequest.sonarrId[o][this.config.uuid] = sonarrId;
          }
        }
        if (!exists)
          dbRequest.sonarrId.push({
            [this.config.uuid]: sonarrId,
          });
        await dbRequest.save();
      } catch (err) {
        console.log(err.stack);
        logger.log("error", `SERVICE - SONARR: Can't update request in Db`);
        logger.log({ level: "error", message: err });
      }
    }
  }

  async remove(serverId, id) {
    this.config = this.findUuid(serverId, this.fullConfig);
    const active = await this.connect();
    if (!active) {
      return false;
    }
    try {
      return this.delete(`series/${id}`, {
        deleteFiles: false,
        addImportListExclusion: false,
      });
    } catch {
      logger.warn("SONARR: Unable to remove job, likely already removed");
    }
  }

  async calendar() {
    let mainCalendar = [];
    let now = new Date();
    for (let server of this.fullConfig) {
      if (server.active) {
        this.config = server;

        try {
          const seriesInfo = await this.get("/series").then(this.transformSeriesData);
          let serverCal = await this.get("/calendar", {
            unmonitored: true,
            start: new Date(
              now.getFullYear(),
              now.getMonth() - 1,
              1
            ).toISOString().split('T')[0],
            end: new Date(
              now.getFullYear(),
              now.getMonth() + 2,
              1
            ).toISOString().split('T')[0],
          });
          serverCal.map((item) => {
            const seriesId = item.seriesId;
            const series = seriesInfo[seriesId];
            if (series) {
              item.series = { title: series.title };
            }
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

  transformSeriesData(seriesArray) {
    return seriesArray.reduce((acc, curr) => {
      const { id, ...rest } = curr;
      acc[id] = rest;
      return acc;
    }, {});
  }
}

module.exports = Sonarr;
