const cluster = require("cluster");
const mongoose = require("mongoose");
const numCPUs = require("os").cpus().length;
require("dotenv/config");

require("./node_modules/cache-manager/lib/stores/memory.js");

const logger = require("./util/logger");
const pjson = require("./package.json");
const trending = require("./tmdb/trending");
const Workr = require("./worker");
const { SetupRouter } = require("./router");
const { loadConfig, conf } = require("./util/config");

const wrkr = new Workr();

class App {
  constructor() {
    this.server = null;
    if (cluster.isMaster) {
      this.Main();
    } else {
      this.Worker();
    }
  }

  Main() {
    logger.log("info", `Petio Version ${pjson.version}`);
    try {
      // load config
      loadConfig();

      // setup the core of the router
      this.server = SetupRouter(this);

      if (conf.get('admin.id') != null) {
        // load db
        this.dbConnect();

        // pull tending data
        trending();
      }

      // check the num of cpu cores
      if (numCPUs < 2) {
        logger.warn(
          "You have less then the recommended logical cores (2 cores) available, performance will be affected"
        );
      }

      // fork process for worker to run on
      cluster.fork();

    } catch (e) {
      logger.error(e);
      wrkr.close();
      process.exit(0);
    }

    logger.log("info", "Listening on: " + conf.get('petio.host') + ":" + conf.get('petio.port'));

    // check if admin id is set else we tell the user they need to go through setup
    if (conf.get('admin.id') == null) {
      logger.log("warn", "Initial setup is required");
    }
  }

  Worker() {
    try {
      // load config
      loadConfig();
    } catch (e) {
      logger.error("worker failed to run");
      logger.error(e);
      return;
    }

    if (conf.get('admin.id') != null) {
      wrkr.startCrons();
    } else {
      logger.verbose('worker disabled until app is setup');
    }
  };

  async Restart() {
    if (this.server != null) {
      this.server.close();
    }
    this.Main();
  }

  async dbConnect() {
    try {
      mongoose.connect(conf.get('db.url'), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } catch (err) {
      logger.log("error", "Error connecting to database");
      logger.log({ level: "error", message: err });
    }
  };
}

new App();