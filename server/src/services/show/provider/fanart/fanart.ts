import { Service } from 'diod';
import { Err, Ok } from 'oxide.ts';

import {
  InternalServerErrorException,
  NotFoundException,
} from '@/infrastructure/exceptions/exceptions';
import { ApiError, FanartTVAPI } from '@/infrastructure/fanart/client';
import is from '@/infrastructure/utils/is';
import { CacheService } from '@/services/cache/cache';
import {
  ShowArtworkProvider,
  ShowProviderArtworkImagesResponse,
} from '@/services/show/provider/provider';

@Service()
export class FanartShowProvider implements ShowArtworkProvider {
  /**
   * The default time-to-live (TTL) for caching movie data.
   * The value is set to 1 day (86400000 milliseconds).
   */
  private defaultCacheTTL = 86400000;

  constructor(
    private readonly client: FanartTVAPI,
    private readonly cache: CacheService,
  ) {}

  public async getArtworkImages(
    id: number,
  ): Promise<ShowProviderArtworkImagesResponse> {
    try {
      const images = await this.cache.wrap(
        `fanart.show.${id}.images`,
        async () => {
          const artworkImages = await this.client.tv.getTvImages({
            showId: id.toString(),
          });
          return {
            logo: artworkImages?.hdtvlogo
              ?.filter(
                (logo) =>
                  is.truthy(logo.url) &&
                  is.truthy(logo.lang) &&
                  logo.lang === 'en',
              )[0]
              .url?.replace('http://', 'https://'),
            thumbnail: artworkImages?.tvthumb
              ?.filter(
                (thumb) => is.truthy(thumb.url) && thumb.lang === 'en',
              )[0]
              .url?.replace('http://', 'https://'),
            poster: artworkImages?.tvposter
              ?.filter(
                (poster) => is.truthy(poster.url) && poster.lang === 'en',
              )[0]
              .url?.replace('http://', 'https://'),
            banner: artworkImages?.tvbanner
              ?.filter(
                (banner) => is.truthy(banner.url) && banner.lang === 'en',
              )[0]
              .url?.replace('http://', 'https://'),
            background: artworkImages?.showbackground
              ?.filter(
                (background) =>
                  is.truthy(background.url) && background.lang === 'en',
              )[0]
              .url?.replace('http://', 'https://'),
            seasons: {
              thumbnail: artworkImages?.seasonthumb
                ? artworkImages.seasonthumb
                    .filter(
                      (thumb) =>
                        is.truthy(thumb.url) &&
                        is.truthy(thumb.season) &&
                        thumb.lang === 'en',
                    )
                    .map((thumb) => ({
                      index: parseInt(thumb.season!, 10),
                      url: thumb.url!.replace('http://', 'https://'),
                    }))
                : [],
              banner: artworkImages?.seasonbanner
                ? artworkImages.seasonbanner
                    .filter(
                      (banner) =>
                        is.truthy(banner.url) &&
                        is.truthy(banner.season) &&
                        banner.lang === 'en',
                    )
                    .map((banner) => ({
                      index: parseInt(banner.season!, 10),
                      url: banner.url!.replace('http://', 'https://'),
                    }))
                : [],
            },
          };
        },
        this.defaultCacheTTL,
      );
      return Ok(images);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return Err(new NotFoundException('Show artwork not found'));
        }
      }
      return Err(
        new InternalServerErrorException('Failed to get show artwork'),
      );
    }
  }
}
