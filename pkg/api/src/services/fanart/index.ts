import cache from "../cache/cache";
import { FanartAPI } from '@/infra/fanart/api';
import logger from '@/loaders/logger';

export default async (id, type) => {
  let data: any = {};
  try {
    data = cache.wrap(id, async () => FanartAPI.get('/:type/:id', {
        params: {
          id,
          type,
        },
      }));
  } catch (err) {
    logger.error(`failed to get fanart for ${id} (${type})`, {
      label: 'fanart.index',
    });
    logger.error(err, { label: 'fanart.index' });
  }
  return data;
};
