import Bluebird from 'bluebird';
import pino from 'pino';

import { Logger } from '@/infrastructure/logger/logger';
import { PlexClient } from '@/infrastructure/plex';
import { PlexTvClientCustom } from '@/infrastructure/plextv/custom/PlexTvClientCustom';
import is from '@/infrastructure/utils/is';
import { MediaLibraryEntity } from '@/resources/media-library/entity';
import { MediaLibraryType } from '@/resources/media-library/types';
import { MediaServerEntity } from '@/resources/media-server/entity';
import { MovieEntity } from '@/resources/movie/entity';
import { ShowEntity } from '@/resources/show/entity';
import { ShowSeasonProps } from '@/resources/show/types';
import { UserEntity } from '@/resources/user/entity';
import {
  ContentResultType,
  ScannerProvider,
} from '@/services/scanner/provider';

export class PlexScannerProvider implements ScannerProvider {
  /**
   * The logger instance for the Plex provider.
   */
  private logger: pino.Logger;

  /**
   * The Plex client used for communication with the Plex server.
   */
  private client: PlexClient;

  /**
   * The Plex TV client used for communication with the Plex TV API.
   */
  private tvClient: PlexTvClientCustom;

  /**
   * Represents a Plex provider for the scanner service.
   */
  constructor(server: MediaServerEntity, logger: Logger) {
    this.client = new PlexClient({
      BASE: server.url,
      HEADERS: {
        'X-Plex-Token': server.token,
      },
    });
    this.tvClient = new PlexTvClientCustom({
      HEADERS: {
        'X-Plex-Token': server.token,
      },
    });
    this.logger = logger.child({
      module: 'services.scanner',
      provider: 'plex',
    });
  }

  /**
   * Retrieves the media libraries from the Plex provider.
   * @returns A promise that resolves to an array of MediaLibraryEntity objects.
   */
  async getLibraries(): Promise<MediaLibraryEntity[]> {
    try {
      const libraries = await this.client.library.getLibraries();
      if (
        !is.truthy(libraries?.MediaContainer) ||
        !is.truthy(libraries?.MediaContainer?.Directory)
      ) {
        return [];
      }
      const filteredLibraries = libraries.MediaContainer.Directory.filter(
        (library) =>
          (is.truthy(library) && library.type === 'show') ||
          library.type === 'movie',
      );
      return filteredLibraries
        .filter((l) => is.truthy(l.uuid))
        .map((library) =>
          MediaLibraryEntity.create({
            allowSync: library.allowSync || false,
            art: library.art || '',
            composite: library.composite || '',
            filters: library.filters || false,
            refreshing: library.refreshing || false,
            thumb: library.thumb || '',
            key: library.key || '',
            type:
              library.type === 'show'
                ? MediaLibraryType.SHOW
                : MediaLibraryType.MOVIE,
            title: library.title || '',
            agent: library.agent || '',
            scanner: library.scanner || '',
            language: library.language || '',
            uuid: library.uuid!,
            scannedAt: library.scannedAt || 0,
            content: library.content || false,
            directory: library.directory || false,
            contentChangedAt: library.contentChangedAt || 0,
            hidden: library.hidden || 0,
          }),
        );
    } catch (error) {
      this.logger.error({ error }, 'Failed to get libraries');
      return [];
    }
  }

  /**
   * Builds the seasons content based on the given rating key.
   * @param ratingKey - The rating key of the content.
   * @returns An array of seasons content.
   */
  private async buildSeasonsContent(
    ratingKey: number,
  ): Promise<ShowSeasonProps[]> {
    const contentResult = await this.client.library.getMetadataChildren({
      ratingKey,
    });
    if (
      !is.truthy(contentResult) ||
      !is.truthy(contentResult.MediaContainer) ||
      !is.truthy(contentResult.MediaContainer.Metadata)
    ) {
      return [];
    }
    const content = await Bluebird.map(
      contentResult.MediaContainer.Metadata,
      async (season) => {
        if (!is.truthy(season.ratingKey) || season.type !== 'season') {
          return undefined;
        }
        const episodesResult = await this.client.library.getMetadataChildren({
          ratingKey: parseInt(season.ratingKey, 10),
          includeElements: 'Stream',
        });
        if (
          !is.truthy(episodesResult) ||
          !is.truthy(episodesResult.MediaContainer) ||
          !is.truthy(episodesResult.MediaContainer.Metadata)
        ) {
          return undefined;
        }
        const episodes = episodesResult.MediaContainer.Metadata.filter(
          (episode) => is.truthy(episode.ratingKey),
        ).map((episode) => ({
          index: episode.index || 0,
          name: episode.title || '',
          description: episode.summary || '',
          resources: episode.Media?.map((media) => ({
            resolution: media.videoResolution || '',
            path: media.Part?.[0]?.file || '',
          })),
        }));
        return {
          index: season.index || 0,
          name: season.title || '',
          episodes,
          providers: {
            plex: parseInt(season.ratingKey, 10),
          },
        };
      },
    );
    return content.filter(is.truthy);
  }

  /**
   * Builds the show content based on the provided rating key.
   * @param ratingKey - The rating key of the show.
   * @returns A ShowEntity object representing the show content, or undefined if the content is not valid.
   */
  private async buildShowContent(ratingKey: number) {
    try {
      const contentResult = await this.client.library.getMetadata({
        ratingKey,
      });
      if (
        !is.truthy(contentResult) ||
        !is.truthy(contentResult.MediaContainer) ||
        !is.truthy(contentResult.MediaContainer.Metadata)
      ) {
        return undefined;
      }
      const content = contentResult.MediaContainer.Metadata[0];
      if (
        !is.truthy(content.ratingKey) ||
        content.type !== 'show' ||
        !is.truthy(content.guid) ||
        !is.truthy(content.Guid)
      ) {
        return undefined;
      }
      const agentProvider = content.guid
        .replace('com.plexapp.agents.', '')
        .split('://');
      const agentSource = agentProvider[0];
      if (agentSource === 'local' || agentSource === 'none') {
        return undefined;
      }
      const tmdbId = content.Guid.find((g) =>
        g.id?.startsWith('tmdb://'),
      )?.id?.split('tmdb://')[1];
      if (!is.truthy(tmdbId)) {
        return undefined;
      }
      const imdbId = content.Guid.find((g) =>
        g.id?.startsWith('imdb://'),
      )?.id?.split('imdb://')[1];
      const tvdbId = content.Guid.find((g) =>
        g.id?.startsWith('tvdb://'),
      )?.id?.split('tvdb://')[1];
      const seasons = await this.buildSeasonsContent(
        parseInt(content.ratingKey, 10),
      );
      return ShowEntity.create({
        title: content.title || '',
        description: content.summary || '',
        certification: content.contentRating || '',
        tagline: content.tagline || '',
        firstAirDate: new Date(content.originallyAvailableAt || ''),
        duration: content.duration || 0,
        seasons,
        rating: {
          tmdb: content.rating || 0,
        },
        artwork: {
          thumbnail: content.thumb || '',
          poster: content.art || '',
        },
        providers: {
          tmdb: parseInt(tmdbId, 10),
          imdb: imdbId,
          tvdb: tvdbId ? parseInt(tvdbId, 10) : undefined,
          plex: ratingKey,
        },
        source: 'plex',
      });
    } catch (error) {
      this.logger.error({ error }, 'Failed to build show content');
      return undefined;
    }
  }

  /**
   * Builds a movie entity based on the provided metadata.
   * @param metadata - The metadata used to build the movie entity.
   * @returns The created movie entity, or undefined if the metadata is invalid.
   */
  private async buildMovieContent(ratingKey: number) {
    try {
      const content = await this.client.library.getMetadata({
        ratingKey,
      });
      if (
        !is.truthy(content) ||
        !is.truthy(content.MediaContainer) ||
        !is.truthy(content.MediaContainer.Metadata)
      ) {
        return undefined;
      }
      const metadata = content.MediaContainer.Metadata[0];
      if (
        !is.truthy(metadata.ratingKey) ||
        metadata.type !== 'movie' ||
        !is.truthy(metadata.guid) ||
        !is.truthy(metadata.Guid)
      ) {
        return undefined;
      }
      const agentProvider = metadata.guid
        .replace('com.plexapp.agents.', '')
        .split('://');
      const agentSource = agentProvider[0];
      if (agentSource === 'local' || agentSource === 'none') {
        return undefined;
      }
      const tmdbId = metadata.Guid.find((g) =>
        g.id?.startsWith('tmdb://'),
      )?.id?.split('tmdb://')[1];
      if (!is.truthy(tmdbId)) {
        return undefined;
      }
      const imdbId = metadata.Guid.find((g) =>
        g.id?.startsWith('imdb://'),
      )?.id?.split('imdb://')[1];
      return MovieEntity.create({
        title: metadata.title || '',
        description: metadata.summary || '',
        certification: metadata.contentRating || '',
        tagline: metadata.tagline || '',
        duration: metadata.duration || 0,
        releaseDate: new Date(metadata.originallyAvailableAt || ''),
        rating: {
          tmdb: metadata.rating || 0,
        },
        artwork: {
          thumbnail: metadata.thumb || '',
          poster: metadata.art || '',
        },
        studios: [
          {
            name: metadata.studio || '',
            logoPath: '',
          },
        ],
        resources: metadata.Media?.map((media) => ({
          resolution: media.videoResolution || '',
          path: media.Part?.[0]?.file || '',
          providers: metadata.ratingKey
            ? {
                plex: {
                  id: parseInt(metadata.ratingKey, 10),
                },
              }
            : undefined,
        })),
        providers: {
          tmdb: {
            id: parseInt(tmdbId, 10),
          },
          imdb: {
            id: imdbId ? parseInt(imdbId, 10) : 0,
          },
          plex: {
            id: ratingKey,
          },
        },
        source: 'plex',
      });
    } catch (error) {
      this.logger.error({ error }, 'Failed to build movie content');
      return undefined;
    }
  }

  /**
   * Retrieves content from the Plex media server for the specified libraries.
   * @param libraries - An array of MediaLibraryEntity objects representing the libraries to retrieve content from.
   * @returns A Promise that resolves when the content retrieval is complete.
   */
  async getLibraryContent<T = ContentResultType>(
    library: MediaLibraryEntity,
  ): Promise<T[]> {
    try {
      const content = await this.client.library.getLibraryItems({
        sectionId: library.key,
        tag: 'all',
      });
      if (
        !is.truthy(content.MediaContainer) ||
        !is.truthy(content.MediaContainer.Metadata)
      ) {
        return [];
      }

      if (library.type === MediaLibraryType.MOVIE) {
        const results = await Bluebird.filter(
          content.MediaContainer.Metadata,
          (r) => is.truthy(r.ratingKey),
        ).map(async (metadata) =>
          this.buildMovieContent(parseInt(metadata.ratingKey!, 10)),
        );
        return results.filter(is.truthy) as T[];
      }

      const results = await Bluebird.filter(
        content.MediaContainer.Metadata,
        (r) => is.truthy(r.ratingKey),
      ).map(async (metadata) =>
        this.buildShowContent(parseInt(metadata.ratingKey!, 10)),
      );
      return results.filter(is.truthy) as T[];
    } catch (error) {
      this.logger.error({ error }, 'Failed to get library content');
      return [];
    }
  }

  /**
   * Retrieves the list of accepted users from the Plex server.
   * @returns A promise that resolves to an array of UserEntity objects representing the accepted users.
   */
  async getUsers(): Promise<UserEntity[]> {
    try {
      const users = await this.tvClient.getFriends();
      return await Bluebird.filter(
        users,
        (user) => user.status === 'accepted',
      ).map((user) =>
        UserEntity.create({
          title: user.friendlyName || user.title,
          username: user.username,
          email: user.email,
          thumbnail: user.thumb,
          altId: user.id.toString(),
        }),
      );
    } catch (error) {
      this.logger.error({ error }, 'Failed to get users');
      return [];
    }
  }

  async getUsersWatchedHistory(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getUsersWatchList(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
