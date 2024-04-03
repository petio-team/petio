/* eslint-disable @typescript-eslint/no-use-before-define */
import axios from 'axios';
import cache from "../cache/cache";
import loggerMain from '@/loaders/logger';
import plexLookup from '@/services/plex/lookup';
import MakePlexURL from '@/services/plex/util';
import { movieLookup } from '@/services/tmdb/movie';
import { showLookup } from '@/services/tmdb/show';

const logger = loggerMain.core.child({ label: "plex.top" });

export default async (type: number) => {
  try {
    const data = await cache.wrap(`pop__${type}`, () => getTopData(type));
    return data;
  } catch (err) {
    logger.error(`Error getting top data - ${type}`, err);
    return [];
  }
};

async function getTopData(type: any) {
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
    return {};
  }
}

async function parseTop(data: { MediaContainer: { Metadata: any; }; }, type: number): Promise<{ [key: string]: any; }> {
  const top = data.MediaContainer.Metadata;
  if (!top) {
    throw new Error("No Plex Top Data, you're probably not a Plex Pass user. This is not an error");
  }
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
    .filter((r: null) => r !== null);
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
