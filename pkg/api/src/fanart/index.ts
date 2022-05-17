import cacheManager from "cache-manager";

import logger from "../app/logger";
import { FanartAPI } from "./api";

const memoryCache = cacheManager.caching({
  store: "memory",
  max: 500,
  ttl: 86400 /*seconds*/,
});

export default async (id, type) => {
  let data: any = false;
  try {
    data = await memoryCache.wrap(id, async function () {
      return await FanartAPI.get("/:type/:id", {
        params: {
          id,
          type,
        },
      });
    });
  } catch (err) {
    logger.error(`failed to get fanart for ${id} (${type})`, {
      label: "fanart.index",
    });
    logger.error(err, { label: "fanart.index" });
  }
  return data;
};
