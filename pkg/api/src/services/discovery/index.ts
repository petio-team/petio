/* eslint-disable import/order */
import Bluebird from 'bluebird';
import _ from 'lodash';

import { getFromContainer } from '@/infra/container/container';
import loggerMain from '@/infra/logger/logger';
import { UserRepository } from '@/resources/user/repository';

import cache from '../cache/cache';
import build from './build';
import display from './display';

const logger = loggerMain.child({ module: 'services.discovery' });

export default async () => {
  logger.debug('started building discovery profiles');
  const ttl = 60 * 60 * 24 * 30; // 30 days

  try {
    const users = await getFromContainer(UserRepository).findAll();
    if (!users.length) {
      return;
    }
    const userIds = users.map((user) => {
      if (user.altId) {
        return user.altId;
      }
      if (!user.custom) {
        return user.plexId;
      }
      return user.id?.toString();
    });
    const validUserIds = _.compact(userIds);
    await Bluebird.map(
      validUserIds,
      async (userId) => {
        logger.debug(`building discovery profile for user - ${userId}`);
        await build(userId);
        const [displayMovies, displayShows] = await Bluebird.all([
          display(userId, 'movie'),
          display(userId, 'show'),
        ]);
        await Bluebird.all([
          cache.set(`discovery.user.movie.${userId}`, displayMovies, ttl),
          cache.set(`discovery.user.show.${userId}`, displayShows, ttl),
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
