// Config
const { conf } = require("../util/config");

const request = require("xhr-request");

const cacheManager = require("cache-manager");
const logger = require("../util/logger");
const memoryCache = cacheManager.caching({ store: "memory", max: 500, ttl: 86400 /*seconds*/ });

async function fanart(id, type) {
  let data = false;
  try {
    data = await memoryCache.wrap(id, function () {
      return fanartData(id, type);
    });
  } catch (err) {
    logger.error(err);
  }
  return data;
}

async function fanartData(id, type) {
  let url = `https://webservice.fanart.tv/v3/${type}/${id}?api_key=${conf.get('general.fanart')}`;
  return new Promise((resolve, reject) => {
    request(
      url,
      {
        method: "GET",
        json: true,
      },
      function (err, data) {
        if (err) {
          reject();
        }
        resolve(data);
      }
    );
  });
}

module.exports = fanart;
