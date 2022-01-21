const axios = require("axios");
const plexLookup = require("../plex/plexLookup");
const Movie = require("../tmdb/movie");
const Show = require("../tmdb/show");
const logger = require("../app/logger");

const MakePlexURL = require('./util');

const cacheManager = require("cache-manager");
const memoryCache = cacheManager.caching({
  store: "memory",
  max: 500,
  ttl: 604800 /*seconds - one week*/,
});

async function getTop(type) {
  let data = false;
  try {
    data = await memoryCache.wrap(`pop__${type}`, function () {
      return getTopData(type);
    });
  } catch (err) {
    logger.log("warn", `Error getting top data - ${type}`);
    logger.log({ level: "error", message: err });
    return [];
  }
  return data;
}

async function getTopData(type) {
  let d = new Date();
  d.setMonth(d.getMonth() - 1);
  d.setHours(0, 0, 0);
  d.setMilliseconds(0);
  let timestamp = (d / 1000) | 0;

  const url = MakePlexURL(
    "/library/all/top",
    {
      "type": type,
      "viewedAt>=": timestamp,
      "limit": 20,
    }
  ).toString();

  try {
    let res = await axios.get(url);
    return parseTop(res.data, type);
  } catch (e) {
    // Do nothing
  }
}

async function parseTop(data, type) {
  let top = data.MediaContainer.Metadata;
  let output = {};
  if (!top)
    throw "No Plex Top Data, you're probably not a Plex Pass user. This is not an error";
  for (let i = 0; i < top.length; i++) {
    let item = top[i];
    let ratingKey = item.ratingKey;
    let plexData = false;
    if (type === 2) {
      plexData = await plexLookup(ratingKey, "show");
    } else {
      plexData = await plexLookup(ratingKey, "movie");
    }
    if (plexData.tmdb_id)
      output[plexData.tmdb_id] =
        type === 2
          ? await Show.showLookup(plexData.tmdb_id, true)
          : await Movie.movieLookup(plexData.tmdb_id, true);
  }
  return output;
}

module.exports = getTop;
