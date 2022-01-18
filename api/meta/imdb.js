// https://www.imdb.com/title/tt6475714/
const axios = require("axios");
const logger = require("../util/logger");
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");
const lineReader = require("line-reader");
const Imdb = require("../models/imdb");

async function lookup(imdb_id) {
  if (!imdb_id) {
    return false;
  }

  let data = await Imdb.findOne({ id: imdb_id });
  if (!data) return false;
  return {
    rating: { ratingValue: data.rating },
    description: false,
  };
}

async function storeCache(firstTime = false) {
  if (firstTime) {
    let exists = await Imdb.findOne({});
    if (exists) {
      logger.verbose("IMDB: Cache exists skipping setup");
      return;
    }
  }
  const unzip = zlib.createGunzip();
  let project_folder, tempFile;
  if (process.pkg) {
    project_folder = path.dirname(process.execPath);
    tempFile = path.join(project_folder, "./imdb_dump.txt");
  } else {
    project_folder = __dirname;
    tempFile = path.join(project_folder, "../imdb_dump.txt");
  }
  logger.verbose("IMDB: Rebuilding Cache");
  try {
    logger.verbose("IMDB: Cache Downloading latest cache");
    const res = await axios({
      url: "https://datasets.imdbws.com/title.ratings.tsv.gz",
      method: "GET",
      responseType: "stream",
    });
    logger.verbose("IMDB: Cache Storing to temp");
    const fileStream = fs.createWriteStream(tempFile);
    res.data.pipe(unzip).pipe(fileStream);
    fileStream.on("close", async () => {
      logger.verbose("IMDB: Cache Download complete");
      try {
        await parseData(tempFile);
        logger.verbose("IMDB: Cache Finished");
      } catch (e) {
        logger.error(e);
        logger.error("IMDB: Cache failed - db write issue");
      }
    });
  } catch (e) {
    logger.log({ level: "error", message: e });
  }
}

async function parseData(file) {
  logger.verbose("IMDB: Cache Emptying old cache");
  await Imdb.deleteMany({});
  logger.verbose("IMDB: Cache cleared");
  logger.verbose("IMDB: Cache parsing download, updating local cache");
  return new Promise((resolve, reject) => {
    let buffer = [];
    lineReader.eachLine(file, async (line, last, cb) => {
      let data = line.split("\t");
      if (data[0] === "tconst" || (parseInt(data[2]) < 1000 && !last)) {
        cb();
        return;
      }
      if (buffer.length < 50000) {
        buffer.push({
          insertOne: {
            document: {
              id: data[0],
              rating: data[1],
            },
          },
        });
        if (!last) {
          cb();
          return;
        }
      }
      try {
        await processBuffer(buffer);
        buffer = [];
        if (last) {
          resolve();
        }
        cb();
      } catch {
        cb(false);
        reject();
      }
    });
  });
}

async function processBuffer(data) {
  try {
    await Imdb.bulkWrite(data);
  } catch {
    throw "IMDB: Error cannot write to Db";
  }
}

module.exports = { lookup, storeCache };
