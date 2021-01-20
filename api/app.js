const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");
const CronJob = require("cron").CronJob;
const fs = require("fs");
const path = require("path");
const pjson = require("./package.json");

// Config
const getConfig = require("./util/config");

// Plex
const LibraryUpdate = require("./plex/libraryUpdate");
const testConnection = require("./plex/testConnection");

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

class Main {
  constructor() {
    // Runs every night at 00:00
    this.cron = new CronJob("0 0 * * *", function () {
      const d = new Date();
      console.log("Full Scan Started:", d);
      new LibraryUpdate().run();
    });

    // Runs every 30 mins
    this.partial = new CronJob("0 */30 * * * *", function () {
      const d = new Date();
      console.log("Partial Scan Started:", d);
      new LibraryUpdate().partial();
    });

    if (process.pkg) {
      this.createConfigDir(path.join(path.dirname(process.execPath), "./config"));
    } else {
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
    console.log("Setting up routes");
    this.e.get("/config", async (req, res) => {
      res.json(this.config ? { config: true } : { config: false });
    });
    this.setup();
    if (this.config) {
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
      this.e.get("*", function (req, res) {
        res.status(404).send("Petio API: route not found");
      });
    }
  }

  async restart() {
    console.log("Restarting server");
    this.cron.stop();
    await this.server.close();
    this.config = getConfig();
    this.init();
  }

  init() {
    this.setRoutes();
    console.log("Starting Server ");
    console.log(`Petio API Version ${pjson.version} alpha`);
    this.server = this.e.listen(7778);
    console.log("Listening");
    if (!this.config) {
      console.log("No config, entering setup mode");
    } else {
      console.log("Connecting to Database, please wait....");
      this.connectDb();
    }
  }

  async connectDb() {
    try {
      await mongoose.connect(this.config.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to Database ");
      this.start();
    } catch (err) {
      console.log(err);
      console.log("Fatal error - database misconfigured!");
      console.log("Removing config please restart");
      fs.unlinkSync("./config/config.json");
    }
  }

  async start() {
    const libUpdate = new LibraryUpdate();
    this.cron.start();
    this.partial.start();
    libUpdate.run();
  }

  setup() {
    this.e.post("/setup/test_server", async (req, res) => {
      let server = req.body.server;
      if (!server) {
        res.status(400).send("Bad Request");
        return;
      }
      try {
        let test = await testConnection(server.protocol, server.host, server.port, server.token);
        let status = test !== 200 ? "failed" : "connected";
        res.status(200).json({
          status: status,
          code: test,
        });
      } catch (err) {
        console.log(err);
        res.status(404).json({
          status: "failed",
          code: 404,
        });
      }
    });
    this.e.post("/setup/test_mongo", async (req, res) => {
      let mongo = req.body.mongo;
      console.log(`testing mongo connection: ${mongo}`);
      if (!mongo) {
        res.status(400).send("Bad Request");
        return;
      }
      try {
        // Ensure no db is passed
        if (mongo.split("@").length > 1) {
          if (mongo.split("@")[1].split("/").length > 1) {
            console.log(mongo.split("@")[1]);
            res.status(401).json({
              status: "failed",
              error: "db path included",
              tried: mongo,
              l: mongo.split("@")[1].split("/").length,
            });
            return;
          }
        }
        await mongoose.connect(mongo + "/petio", {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          socketTimeoutMS: 100,
        });
        mongoose.connection.close();
        res.status(200).json({
          status: "connected",
        });
      } catch (err) {
        res.status(401).json({
          status: "failed",
          error: err,
          tried: mongo,
        });
      }
    });
    this.e.post("/setup/set", async (req, res) => {
      if (this.config) {
        res.status(403).send("Config exists");
        console.log("Error: Config creation blocked, config already exists, this is likely malicious");
        return;
      }
      let user = req.body.user;
      let server = req.body.server;
      let db = req.body.db;
      if (!user || !server || !db) {
        res.status(500).send("Missing Fields");
        return;
      }

      let configData = {
        DB_URL: db + "/petio",
        tmdbApi: "1af5ad19a2d972a67cd27eb033979c4c",
        plexProtocol: server.protocol,
        plexIp: server.host,
        plexPort: server.port,
        plexToken: user.token,
        adminUsername: user.username,
        adminEmail: user.email,
        adminPass: user.password,
        adminId: user.id,
        adminThumb: user.thumb,
        adminDisplayName: user.username,
        fanartApi: "ee409f6fb0c5cd2352e7a454d3f580d4",
      };
      try {
        await this.createConfig(JSON.stringify(configData, null, 2));
        await this.createDefaults();
        res.send("Config Created");
        console.log("Config Created");
        this.restart();
        return;
      } catch (err) {
        res.status(500).send("Error Creating config");
        console.log("Config creation error");
        console.log(err);
      }
    });
  }

  createConfig(data) {
    return new Promise((resolve, reject) => {
      let project_folder, configFile;
      if (process.pkg) {
        project_folder = path.dirname(process.execPath);
        configFile = path.join(project_folder, "./config/config.json");
      } else {
        project_folder = __dirname;
        configFile = path.join(project_folder, "./config/config.json");
      }
      console.log(configFile);
      fs.writeFile(configFile, data, (err) => {
        if (err) {
          console.log(err);
          reject(err);
          console.log("Config Failed");
        } else {
          console.log(data);
          resolve();
          console.log("Config Created");
        }
      });
    });
  }

  async createDefaults() {
    let project_folder = __dirname;
    let email = process.pkg ? path.join(path.dirname(process.execPath), "./config/email.json") : path.join(project_folder, "./config/email.json");
    let emailDefault = JSON.stringify({
      emailUser: "",
      emailPass: "",
      emailServer: "",
      emailPort: "",
      emailSecure: false,
    });

    let radarr = process.pkg ? path.join(path.dirname(process.execPath), "./config/radarr.json") : path.join(project_folder, "./config/radarr.json");
    let radarrDefault = JSON.stringify([]);

    let sonarr = process.pkg ? path.join(path.dirname(process.execPath), "./config/sonarr.json") : path.join(project_folder, "./config/sonarr.json");
    let sonarrDefault = JSON.stringify([]);
    try {
      await fs.writeFileSync(email, emailDefault);
      await fs.writeFileSync(radarr, radarrDefault);
      await fs.writeFileSync(sonarr, sonarrDefault);

      return;
    } catch (err) {
      console.log("Fatal Error: Cannot create default configs");
      throw err;
    }
  }

  createConfigDir(dir) {
    return new Promise((resolve, reject) => {
      console.log("Attempting to create config dir");
      if (fs.existsSync(dir)) {
        resolve();
        return true;
      }
      fs.mkdirSync(dir);
      console.log("Config Directory Created");
      resolve();
    });
  }
}

const API = new Main();
API.init();

module.exports = API;
