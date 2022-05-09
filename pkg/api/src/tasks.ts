import { Agenda } from "agenda";
import mongoose from "mongoose";

import logger from "./app/logger";
import LibraryUpdate from "./plex/library";
import QuotaSystem from "./requests/quotas";
import { conf } from "./app/config";
import buildDiscovery from "./discovery/build";
import { storeCache } from "./meta/imdb";
import trending from "./tmdb/trending";

const agenda = new Agenda({
  db: { address: conf.get("db.url"), collection: "jobs" },
});

const TASK_NAME = {
  FULL_LIBRARY_SCAN: "full library scan",
  PARTIAL_LIBRARY_SCAN: "partial library scan",
  USER_QUOTA_RESET: "reset user quota",
  IMDB_CACHE: "update imdb cache",
  TMDB_CACHE: "update tmdb cache",
} as const;

agenda.define(TASK_NAME.FULL_LIBRARY_SCAN, async (job: any, done: any) => {
  try {
    await new LibraryUpdate().scan();
    await buildDiscovery();
  } catch (err) {
    logger.error(
      "an error occured while attempting to run task '" +
        TASK_NAME.FULL_LIBRARY_SCAN +
        "'",
      { label: "task" }
    );
    logger.debug(err);
  } finally {
    done();
  }
});

agenda.define(TASK_NAME.PARTIAL_LIBRARY_SCAN, async (job: any, done: any) => {
  try {
    await new LibraryUpdate().partial();
  } catch (err) {
    logger.error(
      "an error occured while attempting to run task '" +
        TASK_NAME.PARTIAL_LIBRARY_SCAN +
        "'",
      { label: "task" }
    );
    logger.debug(err);
  } finally {
    done();
  }
});

agenda.define(TASK_NAME.USER_QUOTA_RESET, async (job: any, done: any) => {
  try {
    await new QuotaSystem().reset();
  } catch (err) {
    logger.error(
      "an error occured while attempting to run task '" +
        TASK_NAME.USER_QUOTA_RESET +
        "'",
      { label: "task" }
    );
    logger.debug(err);
  } finally {
    done();
  }
});

agenda.define(TASK_NAME.IMDB_CACHE, async (job: any, done: any) => {
  try {
    await storeCache();
  } catch (err) {
    logger.error(
      "an error occured while attempting to run task '" +
        TASK_NAME.IMDB_CACHE +
        "'",
      { label: "task" }
    );
    logger.debug(err);
  } finally {
    done();
  }
});

agenda.define(TASK_NAME.TMDB_CACHE, async (job: any, done: any) => {
  try {
    trending();
  } catch (err) {
    logger.error(
      "an error occured while attempting to run task '" +
        TASK_NAME.TMDB_CACHE +
        "'",
      { label: "task" }
    );
    logger.debug(err);
  } finally {
    done();
  }
});

// execute tasks
(async function () {
  await mongoose.connect(conf.get("db.url"));
  await agenda.start();
  await agenda.every(
    conf.get("tasks.library.full"),
    TASK_NAME.FULL_LIBRARY_SCAN
  );
  await agenda.every(
    conf.get("tasks.library.partial"),
    TASK_NAME.PARTIAL_LIBRARY_SCAN
  );
  await agenda.every(conf.get("tasks.quotas"), TASK_NAME.PARTIAL_LIBRARY_SCAN);
  await agenda.every("24 hours", [TASK_NAME.IMDB_CACHE, TASK_NAME.TMDB_CACHE]);
  await agenda.purge();
})();
