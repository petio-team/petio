/* eslint-disable import/order */
import Bluebird from 'bluebird';

import { getFromContainer } from '@/infrastructure/container/container';
import loggerMain from '@/infrastructure/logger/logger';
import { UserRepository } from '@/resources/user/repository';
import { CacheService } from '@/services/cache/cache';
import display from '@/services/discovery/display';

import build from './build';

const logger = loggerMain.child({ module: 'services.discovery' });

export default async () => {
  logger.debug('started building discovery profiles');
  const ttl = 60 * 60 * 24 * 30; // 30 days

  try {
    const users = await getFromContainer(UserRepository).findAll();
    if (!users.length) {
      return;
    }
    logger.debug(`found ${users.length} users to build discovery profiles for`);
    await Bluebird.map(
      users,
      async (user) => {
        logger.debug(
          `building discovery profile for user - ${user.title} (${user.id})`,
        );
        let userId;
        if (user.altId) {
          userId = user.altId;
        } else if (!user.custom) {
          userId = user.plexId;
        } else {
          userId = user.id?.toString();
        }
        await build(userId);
        const [displayMovies, displayShows] = await Bluebird.all([
          display(userId, 'movie'),
          display(userId, 'show'),
        ]);
        await Bluebird.all([
          getFromContainer(CacheService).set(
            `discovery.user.movie.${userId}`,
            displayMovies,
            ttl,
          ),
          getFromContainer(CacheService).set(
            `discovery.user.show.${userId}`,
            displayShows,
            ttl,
          ),
        ]);
      },
      {
        concurrency: 2,
      },
    );
    logger.debug('finished building discovery profiles');
  } catch (error) {
    logger.error(error, `failed to create new discovery profiles for users`);
  }
};
