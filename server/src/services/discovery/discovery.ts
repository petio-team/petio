import Bluebird from 'bluebird';
import { Service } from 'diod';
import pino from 'pino';

import { Logger } from '@/infrastructure/logger/logger';
import { UserRepository } from '@/resources/user/repository';
import { CacheProvider } from '@/services/cache/cache-provider';
import build from '@/services/discovery/build';
import display, { DiscoveryResult } from '@/services/discovery/display';

/**
 * Service responsible for handling user discovery.
 */
@Service()
export class DiscoveryService {
  private logger: pino.Logger;

  constructor(
    logger: Logger,
    private cacheProvider: CacheProvider,
    private userRepo: UserRepository,
  ) {
    this.logger = logger.child({ module: 'services.discovery' });
  }

  /**
   * Builds the user discovery profiles.
   * Retrieves all users and builds their discovery profiles by calling the `build` function.
   * The discovery profiles are then cached for future use.
   */
  async buildUserDiscovery() {
    const users = await this.userRepo.findAll();
    if (!users.length) {
      return;
    }
    await Bluebird.map(
      users,
      async (user) => {
        this.logger.debug(
          `building discovery profile for user - ${user.title} (${user.id})`,
        );
        let userId: string | undefined;
        if (user.altId) {
          userId = user.altId;
        } else if (!user.custom) {
          userId = user.plexId;
        } else {
          userId = user.id?.toString();
        }
        if (!userId) {
          this.logger.debug(
            {
              user: {
                id: user.id,
                name: user.title,
                altId: user.altId,
                plexId: user.plexId,
              },
            },
            `no user id found for user, skipping...`,
          );
          return;
        }
        await build(userId);
        const [displayMovies, displayShows] = await Bluebird.all([
          display(userId, 'movie'),
          display(userId, 'show'),
        ]);
        await Bluebird.all([
          this.cacheProvider.set(
            `discovery.user.movie.${userId}`,
            displayMovies,
            60 * 60 * 24 * 30,
          ),
          this.cacheProvider.set(
            `discovery.user.show.${userId}`,
            displayShows,
            60 * 60 * 24 * 30,
          ),
        ]);
      },
      {
        concurrency: 2,
      },
    );
  }

  /**
   * Retrieves the movies for a given user.
   * @param userId - The ID of the user.
   * @returns A Promise that resolves to an array of movies, or null if no movies are found.
   */
  async getMovies(userId: string) {
    const userResult = await this.userRepo.findOne({ id: userId });
    if (userResult.isNone()) {
      return [];
    }
    const user = userResult.unwrap();
    const userPlexId = user.altId ? user.altId : user.plexId;
    const cachedData = await this.cacheProvider.get<
      DiscoveryResult | undefined
    >(`discovery.user.movie.${userPlexId}`);
    if (cachedData) {
      return cachedData;
    }
    return null;
  }

  /**
   * Retrieves the shows for a given user.
   * @param userId - The ID of the user.
   * @returns A Promise that resolves to the shows for the user, or null if the user is not found or the data is not cached.
   */
  async getShows(userId: string) {
    const userResult = await this.userRepo.findOne({ id: userId });
    if (userResult.isNone()) {
      return null;
    }
    const user = userResult.unwrap();
    const userPlexId = user.altId ? user.altId : user.plexId;
    const cachedData = await this.cacheProvider.get<
      DiscoveryResult | undefined
    >(`discovery.user.show.${userPlexId}`);
    if (cachedData) {
      return cachedData;
    }
    return null;
  }
}
