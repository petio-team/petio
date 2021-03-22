const request = require("xhr-request");
const plexLookup = require("../plex/plexLookup");
const Movie = require("../tmdb/movie");
const Show = require("../tmdb/show");
const logger = require("../util/logger");

// Config
const getConfig = require("../util/config");

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
    logger.log("warn", `Error getting popular data - ${id}`);
    logger.log({ level: "error", message: err });
    return [];
  }
  return data;
}

function getTopData(type) {
  const prefs = getConfig();
  return new Promise((resolve, reject) => {
    let d = new Date();
    d.setMonth(d.getMonth() - 1);
    d.setHours(0, 0, 0);
    d.setMilliseconds(0);
    let timestamp = (d / 1000) | 0;
    let url = `${prefs.plexProtocol}://${prefs.plexIp}:${prefs.plexPort}/library/all/top?type=${type}&viewedAt>=${timestamp}&limit=20&X-Plex-Token=${prefs.plexToken}`;
    request(
      url,
      {
        method: "GET",
        json: true,
      },
      function (err, data) {
        if (err) {
          reject(err);
        }
        resolve(parseTop(data, type));
      }
    );
  });
}

async function parseTop(data, type) {
  let top = data.MediaContainer.Metadata;
  let output = {};
  for (let i = 0; i < top.length; i++) {
    let item = top[i];
    let ratingKey = item.ratingKey;
    let globalViewCount = item.globalViewCount;
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
    output[plexData.tmdb_id].globalViewCount = globalViewCount;
  }
  return output;
}

module.exports = getTop;
