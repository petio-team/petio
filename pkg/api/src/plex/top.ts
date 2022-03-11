import axios from "axios";
import cacheManager from "cache-manager";

import plexLookup from "./lookup";
import { movieLookup } from "../tmdb/movie";
import { showLookup } from "../tmdb/show";
import logger from "../app/logger";
import MakePlexURL from "./util";

const memoryCache = cacheManager.caching({
  store: "memory",
  max: 500,
  ttl: 604800 /*seconds - one week*/,
});

export default async (type) => {
  let data: any = false;
  try {
    data = await memoryCache.wrap(`pop__${type}`, function () {
      return getTopData(type);
    });
  } catch (err) {
    logger.warn(`Error getting top data - ${type}`, { label: "plex.top" });
    logger.error(err, { label: "plex.top" });
    return [];
  }
  return data;
};

async function getTopData(type) {
  let d = new Date();
  d.setMonth(d.getMonth() - 1);
  d.setHours(0, 0, 0);
  d.setMilliseconds(0);
  let timestamp = (d.getTime() / 1000) | 0;

  const url = MakePlexURL("/library/all/top", {
    type: type,
    "viewedAt>=": timestamp,
    limit: 20,
  }).toString();

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
    let plexData: any = false;
    if (type === 2) {
      plexData = await plexLookup(ratingKey, "show");
    } else {
      plexData = await plexLookup(ratingKey, "movie");
    }
    if (plexData.tmdb_id)
      output[plexData.tmdb_id] =
        type === 2
          ? await showLookup(plexData.tmdb_id, true)
          : await movieLookup(plexData.tmdb_id, true);
  }
  return output;
}
