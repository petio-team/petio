const request = require("xhr-request");
const Request = require("../models/request");
const fs = require("fs");
const path = require("path");
var sanitize = require("sanitize-filename");

class Sonarr {
  constructor(id = false) {
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
    if (id !== false) {
      this.config = configParse[id];
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
      let url = `${this.config.protocol}://${this.config.hostname}${this.config.port ? ":" + this.config.port : ""}${this.config.urlBase}/api/${endpoint}${paramsString}`;
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

  async post(endpoint, params = false, body = {}) {
    return this.process("post", endpoint, params, body);
  }

  async connect(test = false) {
    if (!this.config.active && !test) {
      console.log("SERVICE - SONARR: Sonarr not enabled");
      return false;
    }
    try {
      let check = await this.get("system/status");
      if (check.error) {
        console.log("SERVICE - SONARR: ERR Connection failed");
        return false;
      }
      if (check) {
        return true;
      } else {
        console.log("SERVICE - SONARR: ERR Connection failed");
        return false;
      }
    } catch (err) {
      console.log("SERVICE - SONARR: ERR Connection failed");
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

  async queue() {
    let queue = {};
    for (let i; i < this.fullConfig.length; i++) {
      this.config = server;
      const active = await this.connect();
      if (!active) {
        return false;
      }
      await this.refresh();
      queue[i] = await this.get(`queue`);
    }
    return queue;
  }

  async test() {
    return await this.connect(true);
  }

  async add(seriesData) {
    seriesData.ProfileId = this.config.profile;
    seriesData.Path = `${this.config.path_title}${sanitize(seriesData.title)} (${seriesData.year})`;
    seriesData.addOptions = {
      searchForMissingEpisodes: true,
    };

    try {
      let add = await this.post("series", false, seriesData);
      console.log(add);
      return add.id;
    } catch (err) {
      console.log(err);
      console.log(`SERVICE - SONARR: Unable to add series ${err}`);
      return false;
    }
  }

  async processJobs(jobQ) {
    for (let job of jobQ) {
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
              sonarrId: sonarrId,
            },
            { $push: { sonarrId: sonarrId } },
            { useFindAndModify: false }
          );
          if (updatedRequest) {
            console.log(`SERVICE - SONARR: Sonnar job added for ${job.title}`);
          }
        } catch (err) {
          console.log(`SERVICE - SONARR: Unable to add series ${job.title}`);
        }
      }
    }
  }

  async getRequests() {
    console.log(`SERVICE - SONARR: Polling requests`);
    if (!this.fullConfig || this.fullConfig.length === 0) {
      console.log(`SERVICE - SONARR: No active servers`);
      return;
    }
    const requests = await Request.find();
    let jobQ = [];
    for (let req of requests) {
      if (req.type === "tv") {
        if (!req.tvdb_id) {
          console.log(`SERVICE - SONARR: TVDB ID not found for ${req.title}`);
        } else {
          jobQ.push(req);
          console.log(`SERVICE - SONARR: ${req.title} added to job queue`);
        }
      }
    }
    this.processJobs(jobQ);
  }
}

module.exports = Sonarr;
