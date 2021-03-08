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
const cluster = require("cluster");
const trending = require("./tmdb/trending");

// Config
const getConfig = require("./util/config");
const Worker = require("./worker");

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
const filterRoute = require("./routes/filter");
const discoveryRoute = require("./routes/discovery");
const { authRequired } = require("./middleware/auth");

class Main {
  constructor() {
    if (cluster.isMaster) {
      logger.log("info", `API: Petio API Version ${pjson.version} alpha`);
      logger.log("info", "API: API Starting");

      if (process.pkg) {
        logger.log("verbose", "API: Detected pkg env");
        this.createConfigDir(
          path.join(path.dirname(process.execPath), "./config")
        );
      } else {
        logger.log("verbose", "API: Non pkg env");
        this.createConfigDir(path.join(__dirname, "./config"));
      }
      this.e = app;
      this.server = null;
      this.e.use(
        cors({
          origin: (origin, callback) => {
            callback(null, true);
          },
          credentials: true,
        })
      );
      this.e.use(express.json());
      this.e.use(express.urlencoded({ extended: true }));
    }
    this.config = getConfig();
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
      this.e.use("/movie", authRequired, movieRoute);
      this.e.use("/show", authRequired, showRoute);
      this.e.use("/person", authRequired, personRoute);
      this.e.use("/search", authRequired, searchRoute);
      this.e.use("/trending", authRequired, trendingRoute);
      this.e.use("/request", authRequired, requestRoute);
      this.e.use("/top", authRequired, topRoute);
      this.e.use("/history", authRequired, historyRoute);
      this.e.use("/plex", authRequired, plexRoute);
      this.e.use("/review", authRequired, reviewRoute);
      this.e.use("/user", userRoute);
      this.e.use("/genie", authRequired, genieRoute);
      this.e.use("/sessions", authRequired, sessionsRoute);
      this.e.use("/services", authRequired, servicesRoute);
      this.e.use("/mail", authRequired, mailRoute);
      this.e.use("/issue", authRequired, issueRoute);
      this.e.use("/profiles", authRequired, profileRoute);
      this.e.use("/config", authRequired, configRoute);
      this.e.use("/logs", authRequired, logsRoute);
      this.e.use("/filter", authRequired, filterRoute);
      this.e.use("/discovery", authRequired, discoveryRoute);
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
    this.server.close();
    logger.log("verbose", "API: Server stopped");
    this.config = getConfig();
    logger.log("verbose", "API: Config updated from file");
    this.init();
  }

  init() {
    if (cluster.isMaster) {
      // Main API worker
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
          trending();
          cluster.fork();
        }
      } catch (err) {
        logger.log({ level: "error", message: err });
        logger.log("info", "API: Fatal error Stopping server");
        this.cron.stop();
        logger.log("verbose", "API: Stopped crons");
        this.server.close();
        logger.log("verbose", "API: Server stopped");
      }
    } else {
      // Cron Worker on sub thread
      new Worker().startCrons();
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
    } catch (err) {
      logger.log("error", "API: Error connecting to database");
      logger.log({ level: "error", message: err });
      logger.log("error", "API: Fatal error - database misconfigured!");
      logger.log("warn", "API: Removing config please restart");
      fs.unlinkSync("./config/config.json");
    }
  }

  setup() {
    this.e.post("/setup/test_server", async (req, res) => {
      let server = req.body.server;
      if (!server) {
        logger.log("warn", "API: Test Server bad request");
        res.status(400).send("Bad Request");
        return;
      }
      logger.log(
        "verbose",
        `API: Testing Server ${server.protocol}://${server.host}:${server.port}?X-Plex-Token=${server.token}`
      );
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
        logger.log({ level: "error", message: err });
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
          logger.log({ level: "error", message: err });
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
      logger.log({ level: "error", message: err });
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

module.exports = new Main().init();
