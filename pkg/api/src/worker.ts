import Agenda, { JobPriority } from "agenda/es";
import { connect } from "mongoose";

import logger from "./app/logger";
import LibraryUpdate from "./plex/libraryUpdate";
import QuotaSystem from "./requests/quotas";
import { conf } from "./app/config";
import buildDiscovery from "./discovery/build";
import { storeCache } from "./meta/imdb";

export default class Worker {
  async connnectDb() {
    await connect(conf.get('db.url'));
    logger.verbose("Worker: Connected to Database");
  }

  async startCrons() {
    if (conf.get('admin.id') == -1) {
      logger.debug("Worker: Setup not complete, skipping");
      return 1;
    }

    try {
      await this.connnectDb();
      await storeCache(true);

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
        priority: JobPriority.high,
        concurrency: 10,
      }, async (_) => {
        await new LibraryUpdate().scan();
        await buildDiscovery();
      });

      agenda.define('partialPlexLibraryScan', {
        priority: JobPriority.high,
        concurrency: 5,
      }, async (_) => {
        await new LibraryUpdate().partial();
      });

      agenda.define('resetUserQuotas', {
        priority: JobPriority.low,
        concurrency: 2,
      }, async (_) => {
        await new QuotaSystem().reset();
        await storeCache();
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
      console.log(err);
    }
  }
}