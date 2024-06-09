import Bluebird from 'bluebird';
import { Service } from 'diod';
import pino from 'pino';

import { Logger } from '@/infrastructure/logger/logger';
import is from '@/infrastructure/utils/is';
import { MediaLibraryRepository } from '@/resources/media-library/repository';
import { MediaLibraryType } from '@/resources/media-library/types';
import { MediaServerEntity } from '@/resources/media-server/entity';
import { MediaServerRepository } from '@/resources/media-server/repository';
import { MovieEntity } from '@/resources/movie/entity';
import { MovieRepository } from '@/resources/movie/repository';
import { ShowEntity } from '@/resources/show/entity';
import { ShowRepository } from '@/resources/show/repository';
import { MovieService } from '@/services/movie/movie-service';
import { ScannerProvider } from '@/services/scanner/provider';
import { scannerProviders } from '@/services/scanner/providers';
import { ShowService } from '@/services/show/show-service';
import { UserService } from '@/services/user/user';

@Service()
export class ScannerService {
  /**
   * The logger used for logging messages in the scanner service.
   */
  private logger: pino.Logger;

  /**
   * Represents the ScannerService class.
   */
  constructor(
    logger: Logger,
    private mediaLibrary: MediaLibraryRepository,
    private mediaServer: MediaServerRepository,
    private userService: UserService,
    private movieService: MovieService,
    private movieRepository: MovieRepository,
    private showRepository: ShowRepository,
    private showService: ShowService,
  ) {
    this.logger = logger.child({ module: 'services.scanner' });
  }

  /**
   * Retrieves the scanner provider for the given media server.
   *
   * @param server The media server entity.
   * @returns The scanner provider instance or null if no provider is found.
   */
  private getProvider(server: MediaServerEntity): ScannerProvider | null {
    const provider = scannerProviders[server.type];
    if (!provider) {
      this.logger.debug(`No provider found for ${server.type}`);
      return null;
    }
    // eslint-disable-next-line new-cap
    return new provider(server, this.logger);
  }

  /**
   * Synchronizes libraries between media servers and the media library repository.
   *
   * Retrieves libraries from each media server, compares them with the existing libraries in the repository,
   * and performs necessary operations (add, update, delete) to keep the libraries in sync.
   */
  async syncLibraries() {
    const servers = await this.mediaServer.findAll();
    await Bluebird.map(
      servers,
      async (server) => {
        const provider = this.getProvider(server);
        if (!provider) {
          return;
        }
        try {
          const [providerLibraries, repositoryLibraries] = await Promise.all([
            provider.getLibraries(),
            this.mediaLibrary.findAll({}),
          ]);
          const newLibraries = providerLibraries.filter(
            (library) =>
              !repositoryLibraries.some(
                (repoLibrary) => repoLibrary.uuid === library.uuid,
              ),
          );
          const updatedLibraries = providerLibraries.filter((library) =>
            repositoryLibraries.some(
              (repoLibrary) => repoLibrary.uuid === library.uuid,
            ),
          );
          const deletedLibraries = repositoryLibraries.filter(
            (library) =>
              !providerLibraries.some(
                (repoLibrary) => repoLibrary.uuid === library.uuid,
              ),
          );

          await Promise.all([
            this.mediaLibrary.deleteManyByIds(
              deletedLibraries.map((library) => library.id),
            ),
            this.mediaLibrary.createMany(newLibraries),
            ...updatedLibraries.map(async (l) => this.mediaLibrary.update(l)),
          ]);

          this.logger.debug(
            `library stats for server '${server.name}' (${server.id}) - added: ${newLibraries.length}, updated: ${updatedLibraries.length}, deleted: ${deletedLibraries.length}`,
          );
        } catch (error) {
          this.logger.error(
            error,
            `Failed to sync libraries for server '${server.name}' (${server.id})`,
          );
        }
      },
      { concurrency: 2 },
    );
  }

  /**
   * Synchronizes a movie entity with its details from the TMDB API.
   * @param movie - The movie entity to synchronize.
   * @returns A promise that resolves to the updated or created movie entity.
   */
  private async syncMovie(movie: MovieEntity) {
    try {
      if (!is.truthy(movie.providers.tmdb?.id)) {
        return undefined;
      }
      const detailsResult = await this.movieService.getMovie(
        movie.providers.tmdb!.id,
        {
          withArtwork: true,
          withServer: false,
          withRating: true,
        },
      );
      if (detailsResult.isNone()) {
        return undefined;
      }
      const details = detailsResult.unwrap();
      this.logger.debug(`Syncing movie ${movie.title}`);
      return await this.movieRepository.updateOrCreate(
        MovieEntity.create({
          ...details.getProps(),
          resources: movie.resources,
          providers: {
            ...details.providers,
            ...movie.providers,
          },
        }),
      );
    } catch (error) {
      this.logger.error(
        error,
        `Failed to sync movie '${movie.title}' (${movie.providers.tmdb?.id})`,
      );
      return undefined;
    }
  }

  /**
   * Synchronizes a show with its details and updates or creates it in the database.
   * @param show - The show entity to synchronize.
   * @returns A promise that resolves to the updated or created show entity.
   */
  private async syncShow(show: ShowEntity) {
    try {
      if (!is.truthy(show.providers.tmdb)) {
        return undefined;
      }
      const detailsResult = await this.showService.getShow(
        show.providers.tmdb!,
        {
          withArtwork: true,
          withServer: false,
        },
      );
      if (detailsResult.isNone()) {
        return undefined;
      }
      const details = detailsResult.unwrap();
      this.logger.debug(`Syncing show '${show.title}'`);
      return await this.showRepository.updateOrCreate(
        ShowEntity.create({
          ...details.getProps(),
          seasons: details.seasons.map((season) => ({
            ...season,
            episodes: season.episodes.map((episode) => ({
              ...episode,
              resources: show.seasons
                .find((s) => s.index)
                ?.episodes.find((e) => e.index)?.resources,
            })),
            providers: {
              ...season.providers,
              ...show.seasons.find((s) => s.index)?.providers,
            },
          })),
          providers: {
            ...details.providers,
            ...show.providers,
          },
        }),
      );
    } catch (error) {
      this.logger.error(
        error,
        `Failed to sync show '${show.title}' (${show.providers.tmdb})`,
      );
      return undefined;
    }
  }

  /**
   * Synchronizes the content of media servers with the local database.
   * Retrieves libraries from each media server and updates the corresponding entities in the database.
   * Supports both movie and show libraries.
   *
   * @returns {Promise<void>} A promise that resolves when the synchronization is complete.
   * @throws {Error} If an error occurs during the synchronization process.
   */
  async syncContent(): Promise<void> {
    try {
      // TODO: in future servers should return libraries as a relationship
      const servers = await this.mediaServer.findAll();
      await Bluebird.map(
        servers,
        async (server) => {
          const provider = this.getProvider(server);
          if (!provider) {
            return;
          }
          const libraries = await this.mediaLibrary.findAll({});
          await Bluebird.map(
            libraries,
            async (library) => {
              try {
                if (library.type === MediaLibraryType.MOVIE) {
                  await Bluebird.map(
                    await provider.getLibraryContent<MovieEntity>(library),
                    async (movie) => this.syncMovie(movie),
                    { concurrency: 2 },
                  );
                } else if (library.type === MediaLibraryType.SHOW) {
                  await Bluebird.map(
                    await provider.getLibraryContent<ShowEntity>(library),
                    async (show) => this.syncShow(show),
                    { concurrency: 2 },
                  );
                }
              } catch (error) {
                this.logger.error(
                  error,
                  `Failed to sync content for library '${library.title}' (${library.id}) on server '${server.name}' (${server.id})`,
                );
              }
            },
            { concurrency: 2 },
          );
        },
        { concurrency: 2 },
      );
    } catch (error) {
      this.logger.error(error, 'Failed to sync content');
    }
  }

  /**
   * Synchronizes users from media servers.
   * Retrieves users from each media server and updates them in the user service.
   */
  async syncUsers() {
    try {
      await Bluebird.map(
        await this.mediaServer.findAll(),
        async (server) => {
          const provider = this.getProvider(server);
          if (!provider) {
            return;
          }
          try {
            const users = await provider.getUsers();
            await Bluebird.map(users, async (user) => {
              this.logger.debug(
                `Syncing user '${user.username}' from server '${server.name}' (${server.id})`,
              );
              return this.userService.updateUser(user.getProps());
            });
          } catch (error) {
            this.logger.error(
              error,
              `Failed to sync users for server '${server.name}' (${server.id})`,
            );
          }
        },
        { concurrency: 2 },
      );
    } catch (error) {
      this.logger.error(error, 'Failed to sync users');
    }
  }
}
