const request = require("xhr-request");
const Request = require("../models/request");
const fs = require("fs");
const path = require("path");
var sanitize = require("sanitize-filename");

class Radarr {
  constructor(id = false) {
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
    if (id !== false) {
      this.config = this.findUuid(id, configParse);
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
      let url = `${this.config.protocol}://${this.config.hostname}${this.config.port ? ":" + this.config.port : ""}${this.config.urlBase}/api/v3/${endpoint}${paramsString}`;
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
    if (!this.config || this.config.title == "Server Removed") {
      return false;
    }
    if (!this.config.active && !test) {
      console.log("SERVICE - RADARR: Radarr not enabled");
      return false;
    }
    try {
      let check = await this.get("system/status");
      if (check.error) {
        console.log("SERVICE - RADARR: ERR Connection failed");
        return false;
      }
      if (check) {
        return check;
      } else {
        console.log("SERVICE - RADARR: ERR Connection failed");
        return false;
      }
    } catch (err) {
      console.log("SERVICE - RADARR: ERR Connection failed");
      return false;
    }
  }

  async getPaths() {
    return await this.get("rootfolder");
  }

  async getProfiles() {
    return await this.get("qualityProfile");
  }

  lookup(id) {
    return this.get("movie/lookup/tmdb", {
      tmdbId: id,
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
    return this.get(`movie/${id}`);
  }

  async queue() {
    let queue = [];
    for (let i = 0; i < this.fullConfig.length; i++) {
      this.config = this.fullConfig[i];
      const active = await this.connect();
      if (!active) {
        return false;
      }
      await this.refresh();
      queue[i] = await this.get(`queue`);
      queue[i]["serverName"] = this.config.title;
    }
    return queue;
  }

  async test() {
    return await this.connect(true);
  }

  async add(movieData) {
    let system = await this.get("system/status");
    let sep = system.isWindows ? "\\" : "/";
    movieData.qualityProfileId = parseInt(this.config.profile);
    movieData.Path = `${this.config.path_title}${sep}${sanitize(movieData.title)} (${movieData.year})`;
    movieData.addOptions = {
      searchForMovie: true,
    };
    movieData.monitored = true;

    try {
      let add = await this.post("movie", false, movieData);

      if (Array.isArray(add)) {
        if (add[1].errorMessage) throw add[1].errorMessage;
      }
      return add.id;
    } catch (err) {
      console.log(`SERVICE - RADARR: Unable to add movie ${err}`);
      throw err;
    }
  }

  async processJobs(jobQ) {
    for (let job of jobQ) {
      for (let server of this.fullConfig) {
        if (!server.active) {
          console.log(`SERVICE - RADARR: Server not active`);
          return;
        }

        this.config = server;
        try {
          let radarrData = await this.lookup(job.tmdb_id);
          let radarrId = await this.add(radarrData);
          let updatedRequest = await Request.findOneAndUpdate(
            {
              requestId: job.requestId,
            },
            { $push: { radarrId: { [this.config.uuid]: radarrId } } },
            { useFindAndModify: false }
          );
          if (updatedRequest) {
            console.log(`SERVICE - RADARR: [${this.config.title}] Radarr job added for ${job.title}`);
          }
        } catch (err) {
          console.log(`SERVICE - RADARR: [${this.config.title}] Unable to add movie ${job.title} - ERR: ${err}`);
        }
      }
    }
  }

  async getRequests() {
    console.log(`SERVICE - RADARR: Polling requests`);
    if (!this.fullConfig || this.fullConfig.length === 0) {
      console.log(`SERVICE - RADARR: No active servers`);
      return;
    }
    const requests = await Request.find();
    let jobQ = [];
    for (let req of requests) {
      if (req.type === "movie") {
        if (!req.tmdb_id) {
          console.log(`SERVICE - RADARR: TMDB ID not found for ${req.title}`);
        } else if (req.radarrId.length === 0) {
          jobQ.push(req);
          console.log(`SERVICE - RADARR: ${req.title} added to job queue`);
        }
      }
    }
    this.processJobs(jobQ);
  }
}

module.exports = Radarr;
