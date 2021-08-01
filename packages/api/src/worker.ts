import { CronJob } from "cron";
import DatabaseConnect from "./src/app/db";
import LibraryUpdate from "./plex/libraryUpdate";
import QuotaSystem from "./requests/quotas";
import buildDiscovery from "./discovery/build";
import { storeCache as imdbCache } from "./meta/imdb";
import logger from "./util/logger";

class Worker {
  async RunCrons(): Promise<void> {
    await DatabaseConnect();
    try {
      await imdbCache(true);
      const libUpdate = new LibraryUpdate();
      await libUpdate.scan();
      buildDiscovery();
      const run = this.runCron;
      // Runs every night at 00:00
      const cron = new CronJob("0 0 * * *", function () {
        const d = new Date();
        logger.log("info", `CRONW: Full Scan Started @ ${d.toDateString()}`);
        run(1);
      });

      // Runs every 30 mins
      const partial = new CronJob("0 */30 * * * *", function () {
        const d = new Date();
        logger.log("info", `CRONW: Partial Scan Started @ ${d.toDateString()}`);
        run(2);
      });

      // Every Sunday at 11pm
      const resetQuotas = new CronJob("0 11 * * sun", function () {
        logger.log("info", "CRONW: Quotas Cleared");
        run(3);
      });

      logger.log("verbose", `API: Registering Full Scan job`);
      cron.start();
      logger.log("verbose", `API: Registering Partial Scan job`);
      partial.start();
      logger.log("verbose", `API: Registering Quota reset job`);
      resetQuotas.start();
    } catch (err) {
      console.log(err);
      logger.error("CRONW: Failed to start crons!");
    }
  }

  async runCron(type = 1): Promise<void> {
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
        break;
      default:
        logger.log("warn", "CRONW: Invalid cron");
    }
  }
}

export default Worker;
