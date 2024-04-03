/* eslint-disable @typescript-eslint/no-use-before-define */
import axios from 'axios';
import cache from "../cache/cache";
import logger from '@/loaders/logger';
import plexLookup from '@/services/plex/lookup';
import MakePlexURL from '@/services/plex/util';
import { movieLookup } from '@/services/tmdb/movie';
import { showLookup } from '@/services/tmdb/show';

export default async (type) => {
  try {
    const data = await cache.wrap(`pop__${type}`, () => getTopData(type));
    return data;
  } catch (err) {
    logger.warn(`Error getting top data - ${type}`, { label: 'plex.top' });
    logger.error(err, { label: 'plex.top' });
    return [];
  }
};

async function getTopData(type) {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  d.setHours(0, 0, 0);
  d.setMilliseconds(0);
  const timestamp = (d.getTime() / 1000) || 0;

  const url = MakePlexURL('/library/all/top', {
    type,
    'viewedAt>=': timestamp,
    limit: 20,
  }).toString();

  try {
    const res = await axios.get(url);
    return await parseTop(res.data, type);
  } catch (e) {
    // Do nothing
    return {};
  }
}

async function parseTop(data, type) {
  const top = data.MediaContainer.Metadata;
  if (!top)
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw "No Plex Top Data, you're probably not a Plex Pass user. This is not an error";
  const promises = top.map(async (item: { ratingKey: any; }) => {
    const { ratingKey } = item;
    let plexData: any = false;
    if (type === 2) {
      plexData = await plexLookup(ratingKey, 'show');
    } else {
      plexData = await plexLookup(ratingKey, 'movie');
    }
    if (plexData.tmdb_id) {
      const rt = type === 2
        ? await showLookup(plexData.tmdb_id, true)
        : await movieLookup(plexData.tmdb_id, true);
      return { [plexData.tmdb_id]: rt };
    }
    return null;
  })
    .filter((r) => r !== null);
  const results = await Promise.all(promises);
  const mergedResults = results.reduce((acc, item) => {
    if (item) {
      const key = Object.keys(item)[0];
      acc[key] = item[key];
    }
    return acc;
  }, {});
  return mergedResults;
}
