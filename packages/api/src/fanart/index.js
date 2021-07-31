// Config
import getConfig from "../util/config";

import request from "xhr-request";
import cacheManager from "cache-manager";
const memoryCache = cacheManager.caching({ store: "memory", max: 500, ttl: 86400 /*seconds*/ });

async function fanart(id, type) {
  let data = false;
  try {
    data = await memoryCache.wrap(id, function () {
      return fanartData(id, type);
    });
  } catch (err) {
    console.log(err);
  }
  return data;
}

async function fanartData(id, type) {
  const config = getConfig();
  const fanartApi = config.fanartApi;
  let url = `https://webservice.fanart.tv/v3/${type}/${id}?api_key=${fanartApi}`;
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
        // console.log(data);
        resolve(data);
      }
    );
  });
}

export default fanart;
