import { Service } from 'diod';
import { None, Option, Some } from 'oxide.ts';
import pino from 'pino';

import { Logger } from '@/infrastructure/logger/logger';
import { toQueryString } from '@/infrastructure/utils/object-to-query-string';
import { ShowEntity } from '@/resources/show/entity';
import { ShowRepository } from '@/resources/show/repository';
import { ShowProps } from '@/resources/show/types';
import { CacheProvider } from '@/services/cache/cache-provider';
import {
  ShowArtworkProvider,
  ShowProvider,
  ShowTrendingProvider,
} from '@/services/show/provider/provider';
import { GetShowOptions } from '@/services/show/types';

@Service()
export class ShowService {
  /**
   * The default time-to-live (TTL) for caching movie data.
   * The value is set to 1 day (86400000 milliseconds).
   */
  private defaultCacheTTL = 86400000;

  /**
   * The logger used for logging messages in the Show service.
   */
  private logger: pino.Logger;

  constructor(
    logger: Logger,
    private showRepository: ShowRepository,
    private cacheProvider: CacheProvider,
    private showProvider: ShowProvider,
    private showArtworkProvider: ShowArtworkProvider,
    private showTrendingProvider: ShowTrendingProvider,
  ) {
    this.logger = logger.child({ module: 'services.show' });
  }

  /**
   * Retrieves a show by its ID.
   *
   * @param id - The ID of the show.
   * @param options - Optional parameters for fetching the show.
   * @returns A Promise that resolves to an Option containing the ShowEntity if found, or None if not found.
   */
  async getShow(
    id: number,
    options?: GetShowOptions,
  ): Promise<Option<ShowEntity>> {
    const optionsAsString =
      options && Object.keys(options).length ? toQueryString(options) : '';
    const cacheName = `show.${id}${optionsAsString}`;
    try {
      const start = Date.now();
      const result = await this.cacheProvider.wrap<ShowProps | undefined>(
        cacheName,
        async () => {
          const [dbResult, detailsResult] = await Promise.all([
            options?.withServer
              ? this.showRepository.findOne({ tmdb_id: id })
              : undefined,
            this.showProvider.getDetails(id),
          ]);
          if (detailsResult.isErr()) {
            return undefined;
          }
          const details = detailsResult.unwrap();

          const artworkResult =
            options?.withArtwork && details.providers.tvdb
              ? await this.showArtworkProvider.getArtworkImages(
                  details.providers.tvdb,
                )
              : undefined;
          const artwork = artworkResult?.isOk()
            ? artworkResult.unwrap()
            : undefined;
          return {
            ...details,
            artwork: {
              ...details.artwork,
              logo: artwork?.logo || details.artwork.logo,
              thumbnail: artwork?.thumbnail || details.artwork.thumbnail,
            },
            seasons: details.seasons.map((season) => ({
              ...season,
              posterPath:
                artwork?.seasons?.thumbnail?.find(
                  (thumb) => thumb.index === season.index,
                )?.url || season.posterPath,
              bannerPath:
                artwork?.seasons?.banner?.find(
                  (banner) => banner.index === season.index,
                )?.url || season.bannerPath,
            })),
            providers: {
              ...details.providers,
              plex: dbResult?.isSome()
                ? parseInt(dbResult.unwrap().id, 10)
                : undefined,
            },
          };
        },
        this.defaultCacheTTL,
      );
      if (!result) {
        this.logger.debug({ showId: id }, 'show not found');
        return None;
      }
      const end = Date.now();
      this.logger.debug(
        { showId: id, name: result.title, seasons: result.seasons.length },
        `got show details in ${end - start}ms`,
      );
      return Some(ShowEntity.create(result));
    } catch (error) {
      this.logger.error(
        { showId: id, error },
        'Failed to lookup show: an error occurred',
      );
      return None;
    }
  }

  /**
   * Retrieves a batch of shows based on the provided IDs.
   * @param ids - An array of show IDs.
   * @param minified - A boolean indicating whether to retrieve minified show data.
   * @returns A promise that resolves to an array of show results.
   */
  async getBatchedShows(ids: number[], minified: boolean = false) {
    const showResult = await Promise.all(
      ids.map((m) =>
        this.getShow(m, {
          withServer: true,
          withArtwork: !minified,
        }),
      ),
    );
    return showResult
      .filter((show) => show.isSome())
      .map((show) => show.unwrap());
  }

  /**
   * Retrieves the trending shows.
   * @returns A Promise that resolves to an Option of ShowEntity array.
   */
  async getTrending(): Promise<ShowEntity[]> {
    try {
      const trending = await this.cacheProvider.wrap<ShowProps[]>(
        'show.trending',
        async () => {
          const ids = await this.showTrendingProvider.getTrending();
          const data = await Promise.all(
            ids
              .unwrap()
              .map((id) =>
                this.getShow(id, { withArtwork: true, withServer: true }),
              ),
          );
          return data
            .filter((show) => show.isSome())
            .map((show) => show.unwrap().getProps());
        },
        this.defaultCacheTTL,
      );
      return trending.map((props) => ShowEntity.create(props));
    } catch (error) {
      this.logger.error({ error }, 'Error fetching trending shows');
      return [];
    }
  }
}
