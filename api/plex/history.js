const request = require("xhr-request");
const plexLookup = require("../plex/plexLookup");
const Movie = require("../tmdb/movie");
const Show = require("../tmdb/show");

// Config
const getConfig = require("../util/config");

const cacheManager = require("cache-manager");
const logger = require("../util/logger");
const memoryCache = cacheManager.caching({
  store: "memory",
  max: 500,
  ttl: 3600 /*seconds*/,
});

async function getHistory(id, type) {
  let data = false;
  try {
    data = await memoryCache.wrap(`hist__${id}__${type}`, function () {
      return getHistoryData(id, type);
    });
  } catch (err) {
    logger.log("warn", `Error getting history data - ${id}`);
    logger.log({ level: "error", message: err });
  }
  return data;
}

function getHistoryData(id, type) {
  logger.info("History returned from source");
  const prefs = getConfig();
  return new Promise((resolve, reject) => {
    let d = new Date();
    d.setMonth(d.getMonth() - 1);
    d.setHours(0, 0, 0);
    d.setMilliseconds(0);
    let timestamp = (d / 1000) | 0;
    let url = `${prefs.plexProtocol}://${prefs.plexIp}:${prefs.plexPort}/status/sessions/history/all?sort=viewedAt%3Adesc&accountID=${id}&viewedAt>=0&X-Plex-Container-Start=0&X-Plex-Container-Size=100&X-Plex-Token=${prefs.plexToken}`;
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
        if (!data) {
          resolve({});
        } else {
          resolve(parseHistory(data, type));
        }
      }
    );
  });
}

async function parseHistory(data, type) {
  if (type === "show") {
    type = "episode";
  }
  let history = data.MediaContainer.Metadata;
  let output = {};
  if (!history) {
    return output;
  }
  let histArr = new Array();
  for (let i = 0; i < history.length; i++) {
    let item = history[i];
    if (type === item.type) {
      let media_type = item.type;
      let media_id = item.ratingKey;
      let media_title = item.title;

      if (type === "episode" && item.grandparentKey) {
        media_id = item.grandparentKey.replace("/library/metadata/", "");
        media_title = item.grandparentTitle;
      } else if (type === "episode" && item.parentKey) {
        media_id = item.parentKey.replace("/library/metadata/", "");
      }

      let key = media_id;

      if (!histArr.includes(key)) {
        if (type === "episode") {
          let plexData = await plexLookup(media_id, "show");
          media_id = plexData.tmdb_id;
        } else {
          let plexData = await plexLookup(media_id, "movie");
          media_id = plexData.tmdb_id;
        }

        histArr.push(key);

        if (media_type === type && Object.keys(output).length < 19) {
          output[i] =
            type === "movie"
              ? await Movie.movieLookup(media_id, true)
              : await Show.showLookup(media_id, true);
        }
      }
    }
  }
  return output;
}

module.exports = getHistory;
