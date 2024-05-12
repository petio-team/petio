import pino from 'pino';

import { Logger } from '@/infrastructure/logger/logger';
import { PlexClient } from '@/infrastructure/plex';
import is from '@/infrastructure/utils/is';
import { MediaLibraryEntity } from '@/resources/media-library/entity';
import { MediaLibraryType } from '@/resources/media-library/types';
import { MediaServerEntity } from '@/resources/media-server/entity';
import { UserEntity } from '@/resources/user/entity';
import { ScannerProvider } from '@/services/scanner/provider';

export class PlexScannerProvider implements ScannerProvider {
  private logger: pino.Logger;

  private client: PlexClient;

  constructor(private server: MediaServerEntity, logger: Logger) {
    this.client = new PlexClient({
      BASE: server.url,
      HEADERS: {
        'X-Plex-Token': server.token,
      },
    });
    this.logger = logger.child({ provider: 'plex' });
  }

  async getLibraries(): Promise<MediaLibraryEntity[]> {
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
  }

  async getContent(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getUsers(): Promise<UserEntity[]> {
    throw new Error('Method not implemented.');
  }

  async getWatchedHistory(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getWatchList(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
