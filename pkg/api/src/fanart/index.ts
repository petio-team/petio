import request from "xhr-request";
import cacheManager from "cache-manager";

import logger from "../app/logger";
import { fanartApiKey } from "../app/env";

const memoryCache = cacheManager.caching({ store: "memory", max: 500, ttl: 86400 /*seconds*/ });

export default async (id, type) => {
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
  let url = `https://webservice.fanart.tv/v3/${type}/${id}?api_key=${fanartApiKey}`;
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