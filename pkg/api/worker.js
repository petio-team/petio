const CronJob = require("cron").CronJob;
const logger = require("./app/logger");
const LibraryUpdate = require("./plex/libraryUpdate");
const QuotaSystem = require("./requests/quotas");
const { conf } = require("./app/config");
const mongoose = require("mongoose");
const buildDiscovery = require("./discovery/build");
const { storeCache: imdbCache } = require("./meta/imdb");

class Worker {
  async connnectDb() {
    await mongoose.connect(conf.get('db.url'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.verbose("CRONW: Connected to Database");
  }

  async startCrons() {
    if (conf.get('admin.id') == null) {
      logger.debug("Worker: Setup not complete, skipping");
      return 1;
    }

    try {
      await this.connnectDb();
      await imdbCache(true);
      const libUpdate = new LibraryUpdate();
      await libUpdate.scan();
      buildDiscovery();
      const run = this.runCron;
      // Runs every night at 00:00
      this.cron = new CronJob("0 0 * * *", function () {
        const d = new Date();
        logger.log("verbose", `CRONW: Full Scan Started @ ${d.toDateString()}`);
        run(1);
      });

      // Runs every 30 mins
      this.partial = new CronJob("0 */30 * * * *", function () {
        const d = new Date();
        logger.log("verbose", `CRONW: Partial Scan Started @ ${d.toDateString()}`);
        run(2);
      });

      // Every Sunday at 11pm
      this.resetQuotas = new CronJob("0 11 * * sun", function () {
        logger.log("verbose", "CRONW: Quotas Cleared");
        run(3);
      });

      logger.log("verbose", `API: Registering Full Scan job`);
      this.cron.start();
      logger.log("verbose", `API: Registering Partial Scan job`);
      this.partial.start();
      logger.log("verbose", `API: Registering Quota reset job`);
      this.resetQuotas.start();
    } catch (err) {
      logger.error(err);
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
        imdbCache();
      default:
        logger.log("warn", "CRONW: Invalid cron");
    }
  }

  close() {
    if (this.cron != undefined) {
      this.cron.stop();
    }
  }
}

module.exports = Worker;
