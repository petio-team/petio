import { getFromContainer } from '@/infrastructure/container/container';
import { FanartAPI } from '@/infrastructure/fanart/api';
import loggerMain from '@/infrastructure/logger/logger';
import { CacheService } from '@/services/cache/cache';

const logger = loggerMain.child({ module: 'fanart.index' });

export default async (id: string, type: any) => {
  let data: any = {};
  try {
    data = getFromContainer(CacheService).wrap(id, async () =>
      FanartAPI.get('/:type/:id', {
        params: {
          id,
          type,
        },
      }),
    );
  } catch (err) {
    logger.error(`failed to get fanart for ${id} (${type})`, err);
  }
  return data;
};
