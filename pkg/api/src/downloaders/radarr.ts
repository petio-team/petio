import axios from "axios";
import { URL, URLSearchParams } from 'url';

import Request from "../models/request";
import logger from "../app/logger";
import { conf } from '../app/config';

export default class Radarr {
  config: any;
  forced: any;
  fullConfig: any;
  constructor(id: any = false, forced = false, profileOvr = false, pathOvr = false) {
    this.fullConfig = conf.get('radarr');
    this.config = false;
    this.forced = forced;

    if (id !== false) {
      this.config = this.fullConfig.filter((i) => i.uuid == id)[0];
      if (profileOvr) {
        this.config.profile.id = profileOvr;
      }
      if (pathOvr) {
        this.config.path.location = pathOvr;
      }
    }
  }

  async process(method, endpoint, params = {}, body = {}) {
    if (!this.config.host) {
      return;
    }
    const baseurl = `${this.config.protocol}://${this.config.host}${this.config.port ? ":" + this.config.port : ""}${this.config.subpath == "/" ? '' : this.config.subpath}/api/v3/`;
    const apiurl = new URL(endpoint, baseurl);
    const prms = new URLSearchParams();

    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        prms.set(key, params[key]);
      }
    }

    prms.set('apikey', this.config.key);
    apiurl.search = prms.toString();

    try {
      if (method === "post" && body) {
        let res = await axios.post(apiurl.toString(), body);
        if (typeof res.data !== 'object') {
          return Error("not a valid object");
        }
        return res.data;
      } else {
        let res = await axios.get(apiurl.toString());
        if (typeof res.data !== 'object') {
          return Error("not a valid object");
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

  async get(endpoint, params = {}) {
    return this.process("get", endpoint, params);
  }

  async delete(endpoint, params = {}) {
    return this.process("delete", endpoint, params);
  }

  async post(endpoint, params = {}, body = {}) {
    return this.process("post", endpoint, params, body);
  }

  async connect(test = false) {
    if (!this.config || this.config.title == "Server Removed") {
      return false;
    }
    if (!this.config.enabled && !test) {
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

  async getLanguageProfiles() {
    return await this.get("language");
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

  async add(movieData, path = false, profile = false, tag: any = false) {
    movieData.qualityProfileId = parseInt(
      profile ? profile : this.config.profile.id
    );
    movieData.rootFolderPath = `${path ? path : this.config.path.location}`;
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
          if (!server.enabled) {
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
    logger.log("verbose", `SERVICE - RADARR: Processing request`);
    if (!this.fullConfig || this.fullConfig.length === 0) {
      logger.log("verbose", `SERVICE - RADARR: No active servers`);
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
          logger.log("verbose", "SERVICE - RADARR: Request passed to queue");
          this.processJobs([req]);
        }
      }
    }
  }

  async calendar() {
    let mainCalendar: any = [];
    let now = new Date();
    for (let server of this.fullConfig) {
      if (server.enabled) {
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