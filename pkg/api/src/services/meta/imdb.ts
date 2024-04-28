import axios from 'axios';
import fs from 'fs';
import lineReader from 'line-reader';
import path from 'path';
import zlib from 'zlib';

import { DATA_DIR } from '@/infra/config/env';
import loggerMain from '@/infra/logger/logger';
import Imdb from '@/models/imdb';

const logger = loggerMain.child({ module: 'meta.imdb' });

export async function lookup(imdb_id) {
  if (!imdb_id) {
    return false;
  }

  const data = await Imdb.findOne({ id: imdb_id }).exec();
  if (!data) return false;
  return {
    rating: { ratingValue: data.rating },
    description: false,
  };
}

export async function storeCache(firstTime = false) {
  if (firstTime) {
    const exists = await Imdb.findOne({}).exec();
    if (exists) {
      logger.debug('IMDB: Cache exists skipping setup');
      return;
    }
  }
  const unzip = zlib.createGunzip();
  const tempFile = path.join(DATA_DIR, './imdb_dump.txt');
  logger.debug('IMDB: Rebuilding Cache');
  try {
    logger.debug('IMDB: Cache Downloading latest cache', {
      module: 'meta.imdb',
    });
    const res = await axios({
      url: 'https://datasets.imdbws.com/title.ratings.tsv.gz',
      method: 'GET',
      responseType: 'stream',
    });
    logger.debug('IMDB: Cache Storing to temp');
    const fileStream = fs.createWriteStream(tempFile);
    res.data.pipe(unzip).pipe(fileStream);
    fileStream.on('close', async () => {
      logger.debug('IMDB: Cache Download complete');
      try {
        await parseData(tempFile);
        logger.debug('IMDB: Cache Finished');
      } catch (err) {
        logger.error('IMDB: Cache failed - db write issue', err);
      }
    });
  } catch (err) {
    logger.error(`failed to store in cache`, err);
  }
}

async function parseData(file): Promise<any> {
  logger.debug('IMDB: Cache Emptying old cache');
  await Imdb.deleteMany({}).exec();
  logger.debug('IMDB: Cache cleared, parsing download, updating local cache');
  return new Promise((resolve, reject) => {
    let buffer: any = [];
    lineReader.eachLine(file, async (line, last, cb) => {
      const data = line.split('\t');
      if (data[0] === 'tconst' || (parseInt(data[2], 10) < 1000 && !last)) {
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
          resolve(buffer);
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
  await Imdb.bulkWrite(data);
}
