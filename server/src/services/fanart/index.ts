import { getFromContainer } from '@/infrastructure/container/container';
import { FanartTVAPI } from '@/infrastructure/fanart/client';
import loggerMain from '@/infrastructure/logger/logger';
import { CacheService } from '@/services/cache/cache';

const logger = loggerMain.child({ module: 'fanart.index' });

export default async (id: string, type: any) => {
  let data: any = {};
  try {
    data = getFromContainer(CacheService).wrap(id, async () => {
      const client = getFromContainer(FanartTVAPI);
      switch (type) {
        case 'movie': {
          return client.movie.getMovieImages({ movieId: id });
        }
        case 'tv': {
          return client.tv.getTvImages({ showId: id });
        }
        default: {
          throw new Error(`invalid fanart type ${type} for ${id}`);
        }
      }
    });
  } catch (err) {
    logger.error(`failed to get fanart for ${id} (${type})`, err);
  }
  return data;
};
