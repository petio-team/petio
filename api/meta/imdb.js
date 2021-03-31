// https://www.imdb.com/title/tt6475714/
const axios = require("axios");
const cheerio = require("cheerio");
const logger = require("../util/logger");

const cacheManager = require("cache-manager");
const memoryCache = cacheManager.caching({
  store: "memory",
  max: 1000,
  ttl: 604800 /*seconds*/,
});

async function lookup(imdb_id) {
  return false;
  if (!imdb_id) {
    return false;
  }

  try {
    let data = await getRaw(imdb_id);
    return data;
  } catch (err) {
    return {
      rating: false,
      description: false,
    };
  }
}

async function getRaw(id) {
  let data = false;
  try {
    data = await memoryCache.wrap(`imdb_${id}`, function () {
      return crawl(id);
    });
  } catch (err) {
    logger.log("warn", `Error crawling imdb - ${id}`);
    logger.log({ level: "error", message: err });
  }
  return data;
}

async function crawl(id) {
  try {
    let res = await axios.get(`https://www.imdb.com/title/${id}`);
    let raw = cheerio.load(res.data);
    let meta = JSON.parse(raw(`script[type='application/ld+json']`).html());
    let rating = meta.aggregateRating;
    delete rating["@type"];
    let description = meta.description;
    return {
      rating: rating,
      description: description,
    };
  } catch (err) {
    return {
      rating: false,
      description: false,
    };
  }
}

module.exports = lookup;
