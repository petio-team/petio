const CronJob = require("cron").CronJob;
const logger = require("./util/logger");
const LibraryUpdate = require("./plex/libraryUpdate");
const QuotaSystem = require("./requests/quotas");
const getConfig = require("./util/config");
const mongoose = require("mongoose");
const buildDiscovery = require("./discovery/build");

class Worker {
  async connnectDb() {
    const config = getConfig();
    if (!config) {
      logger.log("info", "CRONW: Failed to connect to DB");
      throw "Failed to connect to DB";
    }

    await mongoose.connect(config.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.log("info", "CRONW: Connected to Database");
  }

  async startCrons() {
    try {
      await this.connnectDb();
      const libUpdate = new LibraryUpdate();
      await libUpdate.scan();
      buildDiscovery();
      const run = this.runCron;
      // Runs every night at 00:00
      this.cron = new CronJob("0 0 * * *", function () {
        const d = new Date();
        logger.log("info", `CRONW: Full Scan Started @ ${d.toDateString()}`);
        run(1);
      });

      // Runs every 30 mins
      this.partial = new CronJob("0 */30 * * * *", function () {
        const d = new Date();
        logger.log("info", `CRONW: Partial Scan Started @ ${d.toDateString()}`);
        run(2);
      });

      // Every Sunday at 11pm
      this.resetQuotas = new CronJob("0 11 * * sun", function () {
        logger.log("info", "CRONW: Quotas Cleared");
        run(3);
      });

      logger.log("verbose", `API: Registering Full Scan job`);
      this.cron.start();
      logger.log("verbose", `API: Registering Partial Scan job`);
      this.partial.start();
      logger.log("verbose", `API: Registering Quota reset job`);
      this.resetQuotas.start();
    } catch (err) {
      logger.error("CRONW: Failed to start crons!");
    }
  }

  async runCron(type = 1) {
    switch (type) {
      case 1:
        new LibraryUpdate().scan();
        buildDiscovery();
        break;
      case 2:
        new LibraryUpdate().partial();
        break;
      case 3:
        new QuotaSystem().reset();
      default:
        logger.log("warn", "CRONW: Invalid cron");
    }
  }
}

module.exports = Worker;
