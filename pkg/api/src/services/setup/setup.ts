import { getFromContainer } from '@/infra/container/container';
import logger from '@/infra/logger/logger';
import { MovieRepository } from '@/resources/movie/repository';
import { ShowRepository } from '@/resources/show/repository';
import { UserRepository } from '@/resources/user/repository';

export default async () => {
  try {
    const [movie, show, user] = await Promise.all([
      getFromContainer(MovieRepository).findOne({}),
      getFromContainer(ShowRepository).findOne({}),
      getFromContainer(UserRepository).findOne({}),
    ]);
    if (movie && show && user) {
      return {
        ready: true,
        error: false,
      };
    }
    return {
      ready: false,
      error: false,
    };
  } catch (e) {
    logger.error('setup ready check failed to get ready');
    logger.error(e);
    return {
      ready: false,
      error: 'setup ready failed',
    };
  }
};
