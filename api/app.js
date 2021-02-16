const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");
const CronJob = require("cron").CronJob;
const fs = require("fs");
const path = require("path");
const pjson = require("./package.json");
require("./node_modules/cache-manager/lib/stores/memory.js");
const logger = require("./util/logger");

// Config
const getConfig = require("./util/config");

// Plex
const LibraryUpdate = require("./plex/libraryUpdate");
const testConnection = require("./plex/testConnection");

const QuotaSystem = require("./requests/quotas");

// Routes
const movieRoute = require("./routes/movie");
const showRoute = require("./routes/show");
const searchRoute = require("./routes/search");
const personRoute = require("./routes/person");
const loginRoute = require("./routes/login");
const trendingRoute = require("./routes/trending");
const requestRoute = require("./routes/request");
const topRoute = require("./routes/top");
const historyRoute = require("./routes/history");
const plexRoute = require("./routes/plex");
const reviewRoute = require("./routes/review");
const userRoute = require("./routes/user");
const genieRoute = require("./routes/genie");
const sessionsRoute = require("./routes/sessions");
const servicesRoute = require("./routes/services");
const mailRoute = require("./routes/mail");
const issueRoute = require("./routes/issue");
const profileRoute = require("./routes/profiles");
const configRoute = require("./routes/config");
const logsRoute = require("./routes/log");

class Main {
  constructor() {
    logger.log("info", `API: Petio API Version ${pjson.version} alpha`);
    logger.log("info", "API: API Starting");
    // Runs every night at 00:00
    this.cron = new CronJob("0 0 * * *", function () {
      const d = new Date();
      logger.log("info", `CRON: Full Scan Started @ ${d.toDateString()}`);
      new LibraryUpdate().run();
    });

    // Runs every 30 mins
    this.partial = new CronJob("0 */30 * * * *", function () {
      const d = new Date();
      logger.log("info", `CRON: Partial Scan Started @ ${d.toDateString()}`);
      new LibraryUpdate().partial();
    });

    // Every Sunday at 11pm
    this.resetQuotas = new CronJob("0 11 * * sun", function () {
      logger.log("info", "CRON: Quotas Cleared");
      new QuotaSystem().reset();
    });

    if (process.pkg) {
      logger.log("verbose", "API: Detected pkg env");
      this.createConfigDir(
        path.join(path.dirname(process.execPath), "./config")
      );
    } else {
      logger.log("verbose", "API: Non pkg env");
      this.createConfigDir(path.join(__dirname, "./config"));
    }
    this.config = getConfig();
    this.e = app;
    this.server = null;
    this.e.use(cors());
    this.e.options("*", cors());
    this.e.use(express.json());
    this.e.use(express.urlencoded({ extended: true }));
  }

  setRoutes() {
    logger.log("info", "API: Setting up routes");
    this.e.get("/config", async (req, res) => {
      let config = getConfig();
      res.json(
        config
          ? {
              config: true,
              login_type: config.login_type ? config.login_type : 1,
            }
          : { config: false, login_type: 1 }
      );
    });
    this.setup();
    if (this.config) {
      logger.log("verbose", `API: Config found setting routes`);
      this.e.use((req, res, next) => {
        if (req.path !== "/logs/stream")
          logger.log("verbose", `API: Route ${req.path}`);
        next();
      });
      this.e.use("/login", loginRoute);
      this.e.use("/movie", movieRoute);
      this.e.use("/show", showRoute);
      this.e.use("/person", personRoute);
      this.e.use("/search", searchRoute);
      this.e.use("/trending", trendingRoute);
      this.e.use("/request", requestRoute);
      this.e.use("/top", topRoute);
      this.e.use("/history", historyRoute);
      this.e.use("/plex", plexRoute);
      this.e.use("/review", reviewRoute);
      this.e.use("/user", userRoute);
      this.e.use("/genie", genieRoute);
      this.e.use("/sessions", sessionsRoute);
      this.e.use("/services", servicesRoute);
      this.e.use("/mail", mailRoute);
      this.e.use("/issue", issueRoute);
      this.e.use("/profiles", profileRoute);
      this.e.use("/config", configRoute);
      this.e.use("/logs", logsRoute);
      this.e.get("*", function (req, res) {
        logger.log(
          "warn",
          `API: Route not found ${req.url} | IP: ${
            req.headers["x-forwarded-for"] || req.connection.remoteAddress
          }`
        );
        res.status(404).send(`Petio API: route not found - ${req.url}`);
      });
    }
  }

  async restart() {
    logger.log("info", "API: Restarting server");
    this.cron.stop();
    logger.log("verbose", "API: Stopped crons");
    this.server.close();
    logger.log("verbose", "API: Server stopped");
    this.config = getConfig();
    logger.log("verbose", "API: Config updated from file");
    this.init();
  }

  init() {
    logger.log("info", "API: Starting server");
    this.setRoutes();
    try {
      this.server = this.e.listen(7778);
      logger.log("verbose", `API: Listening on 7778 internally`);
      logger.log("info", "API: Server entering listening state");
      if (!this.config) {
        logger.log("warn", "API: No config, entering setup mode");
      } else {
        logger.log("info", "API: Connecting to Database...");
        this.connectDb();
      }
    } catch (err) {
      logger.error(err.stack);
      logger.log("info", "API: Fatal error Stopping server");
      this.cron.stop();
      logger.log("verbose", "API: Stopped crons");
      this.server.close();
      logger.log("verbose", "API: Server stopped");
    }
  }

  async connectDb() {
    logger.log("verbose", `API: Attempting database connection`);
    try {
      await mongoose.connect(this.config.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      logger.log("info", "API: Connected to Database");
      this.start();
    } catch (err) {
      logger.log("error", "API: Error connecting to database");
      logger.error(err.stack);
      logger.log("error", "API: Fatal error - database misconfigured!");
      logger.log("warn", "API: Removing config please restart");
      fs.unlinkSync("./config/config.json");
    }
  }

  async start() {
    // const libUpdate = new LibraryUpdate();
    // logger.log("verbose", `API: Registering Full Scan job`);
    // this.cron.start();
    // logger.log("verbose", `API: Registering Partial Scan job`);
    // this.partial.start();
    // logger.log("verbose", `API: Registering Quota reset job`);
    // this.resetQuotas.start();
    // logger.log("verbose", `API: Running init scan`);
    // libUpdate.run();
  }

  setup() {
    this.e.post("/setup/test_server", async (req, res) => {
      logger.log(
        "verbose",
        `API: Testing Server ${server.protocol}://${server.host}:${server.port}?X-Plex-Token=${server.token}`
      );
      let server = req.body.server;
      if (!server) {
        logger.log("warn", "API: Test Server bad request");
        res.status(400).send("Bad Request");
        return;
      }
      try {
        let test = await testConnection(
          server.protocol,
          server.host,
          server.port,
          server.token
        );
        let status = test !== 200 ? "failed" : "connected";
        res.status(200).json({
          status: status,
          code: test,
        });
        logger.log(
          "verbose",
          `API: Test Server success - ${server.protocol}://${server.host}:${server.port}?X-Plex-Token=${server.token}`
        );
      } catch (err) {
        res.status(404).json({
          status: "failed",
          code: 404,
        });
        logger.log(
          "verbose",
          `API: Test Server failed - ${server.protocol}://${server.host}:${server.port}?X-Plex-Token=${server.token}`
        );
      }
    });
    this.e.post("/setup/test_mongo", async (req, res) => {
      let mongo = req.body.mongo;
      logger.log("info", `API: testing mongo connection: ${mongo}`);
      if (!mongo) {
        res.status(400).send("Bad Request");
        logger.log("warn", "API: Mongo test bad request");
        return;
      }
      try {
        // Ensure no db is passed
        if (mongo.split("@").length > 1) {
          if (mongo.split("@")[1].split("/").length > 1) {
            res.status(401).json({
              status: "failed",
              error: "db path included",
              tried: mongo,
              l: mongo.split("@")[1].split("/").length,
            });
            logger.log("warn", "API: Mongo test db path included");
            return;
          }
        }
        logger.log("verbose", "API: Attempting mongo connection");
        await mongoose.connect(mongo + "/petio", {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          socketTimeoutMS: 100,
        });
        mongoose.connection.close();
        res.status(200).json({
          status: "connected",
        });
        logger.log("info", "API: Mongo test connection success");
      } catch (err) {
        res.status(401).json({
          status: "failed",
          error: err,
          tried: mongo,
        });
        logger.log("warn", "API: Mongo test connection failed");
      }
    });
    this.e.post("/setup/set", async (req, res) => {
      logger.log("verbose", "API: Attempting to create config file");
      if (this.config) {
        res.status(403).send("Config exists");
        logger.log(
          "warn",
          "API: Error: Config creation blocked, config already exists, this is likely malicious"
        );
        return;
      }
      let user = req.body.user;
      let server = req.body.server;
      let db = req.body.db;
      if (!user || !server || !db) {
        res.status(500).send("Missing Fields");
        logger.log("warn", "API: Config creation missing fields");
        return;
      }

      let configData = {
        DB_URL: db + "/petio",
        tmdbApi: "1af5ad19a2d972a67cd27eb033979c4c",
        plexProtocol: server.protocol,
        plexIp: server.host,
        plexPort: server.port,
        plexToken: user.token,
        plexClientID: server.clientId,
        adminUsername: user.username,
        adminEmail: user.email,
        adminPass: user.password,
        adminId: user.id,
        adminThumb: user.thumb,
        adminDisplayName: user.username,
        fanartApi: "ee409f6fb0c5cd2352e7a454d3f580d4",
        base_path: "",
      };
      try {
        await this.createConfig(JSON.stringify(configData, null, 2));
        await this.createDefaults();
        res.send("Config Created");
        logger.log("info", "API: Config Created");
        this.restart();
        return;
      } catch (err) {
        res.status(500).send("Error Creating config");
        logger.log("error", "API: Config creation error");
        logger.error(err.stack);
      }
    });
  }

  createConfig(data) {
    return new Promise((resolve, reject) => {
      logger.log("verbose", "API: Attempting to write config to file");
      let project_folder, configFile;
      if (process.pkg) {
        project_folder = path.dirname(process.execPath);
        configFile = path.join(project_folder, "./config/config.json");
      } else {
        project_folder = __dirname;
        configFile = path.join(project_folder, "./config/config.json");
      }
      logger.log(
        "verbose",
        `API: Attempting to write config file at - ${configFile}`
      );
      fs.writeFile(configFile, data, (err) => {
        if (err) {
          logger.log("error", "API: Writing config to file failed");
          logger.error(err.stack);
          reject(err);
        } else {
          logger.log("info", "API: Config written to file");
          resolve();
        }
      });
    });
  }

  async createDefaults() {
    logger.log(
      "verbose",
      "API: Attempting to create default configs for Sonarr / Radarr / Email"
    );
    let project_folder = __dirname;
    let email = process.pkg
      ? path.join(path.dirname(process.execPath), "./config/email.json")
      : path.join(project_folder, "./config/email.json");
    let emailDefault = JSON.stringify({
      emailUser: "",
      emailPass: "",
      emailServer: "",
      emailPort: "",
      emailSecure: false,
    });

    let radarr = process.pkg
      ? path.join(path.dirname(process.execPath), "./config/radarr.json")
      : path.join(project_folder, "./config/radarr.json");
    let radarrDefault = JSON.stringify([]);

    let sonarr = process.pkg
      ? path.join(path.dirname(process.execPath), "./config/sonarr.json")
      : path.join(project_folder, "./config/sonarr.json");
    let sonarrDefault = JSON.stringify([]);
    try {
      logger.log(
        "verbose",
        `API: Attempting to write email config to file at - ${email}`
      );
      fs.writeFileSync(email, emailDefault);
      logger.log(
        "verbose",
        `API: Attempting to write radarr config to file at - ${radarr}`
      );
      fs.writeFileSync(radarr, radarrDefault);
      logger.log(
        "verbose",
        `API: Attempting to write sonarr config to file at - ${sonarr}`
      );
      fs.writeFileSync(sonarr, sonarrDefault);
      logger.log(
        "info",
        "API: Default config files for email, radarr, sonarr written to file"
      );
      return;
    } catch (err) {
      logger.log("error", "API: Fatal Error: Cannot create default configs");
      logger.error(err.stack);
      return;
    }
  }

  createConfigDir(dir) {
    return new Promise((resolve, reject) => {
      logger.log("verbose", "API: Attempting to create config dir");
      if (fs.existsSync(dir)) {
        logger.log("verbose", `API: config directory found`);
        resolve();
        return true;
      }
      fs.mkdirSync(dir);
      logger.log("info", "API: Config Directory Created");
      resolve();
    });
  }
}

const API = new Main();
API.init();

module.exports = API;
