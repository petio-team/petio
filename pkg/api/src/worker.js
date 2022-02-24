const Agenda = require("agenda");
const mongoose = require("mongoose");

const logger = require("./app/logger");
const LibraryUpdate = require("./plex/libraryUpdate");
const QuotaSystem = require("./requests/quotas");
const { conf } = require("./app/config");
const buildDiscovery = require("./discovery/build");
const { storeCache: imdbCache } = require("./meta/imdb");

class Worker {
  async connnectDb() {
    await mongoose.connect(conf.get('db.url'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.verbose("Worker: Connected to Database");
  }

  async startCrons() {
    if (conf.get('admin.id') == -1) {
      logger.debug("Worker: Setup not complete, skipping");
      return 1;
    }

    try {
      await this.connnectDb();
      await imdbCache(true);

      const agenda = new Agenda(
        {
          db: {
            address: conf.get('db.url'),
            collection: "jobs",
          }
        }
      );

      agenda.on("start", (job) => {
        logger.debug(`Task ${job.attrs.name} starting`);
      });

      agenda.define('fullPlexLibraryScan', {
        priority: "high",
        concurrency: 10,
      }, async (_) => {
        await LibraryUpdate().scan();
        await buildDiscovery();
      });

      agenda.define('partialPlexLibraryScan', {
        priority: "high",
        concurrency: 5,
      }, async (_) => {
        await LibraryUpdate().partial();
      });

      agenda.define('resetUserQuotas', {
        priority: "low",
        concurrency: 2,
      }, async (_) => {
        await QuotaSystem().reset();
        await imdbCache();
      });

      await agenda.start();

      // Tasks to run
      await agenda.every(
        conf.get('tasks.library.full'),
        "fullPlexLibraryScan"
      );

      await agenda.every(
        conf.get('tasks.library.partial'),
        "partialPlexLibraryScan"
      );

      await agenda.every(
        conf.get('tasks.quotas'),
        "resetUserQuotas"
      );

    } catch (err) {
      logger.error("Worker: Failed to run jobs");
      logger.error(err);
    }
  }
}

module.exports = Worker;
