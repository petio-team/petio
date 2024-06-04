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
  MovieArtworkProvider,
  MovieProviderArtworkImagesResponse,
} from '@/services/movie/provider/provider';

@Service()
export class FanartMovieArtworkProvider implements MovieArtworkProvider {
  private defaultCacheTTL = 86400000; // 1 day

  constructor(
    private readonly client: FanartTVAPI,
    private readonly cache: CacheService,
  ) {}

  /**
   * Retrieves artwork images for a movie from the Fanart API.
   *
   * @param id - The ID of the movie.
   * @returns A promise that resolves to a `MovieProviderArtworkImagesResponse` object containing the artwork images.
   */
  async getArtworkImages(
    id: number,
  ): Promise<MovieProviderArtworkImagesResponse> {
    try {
      const images = await this.cache.wrap(
        `fanart.movie.${id}.images`,
        async () => {
          const artworkImages = await this.client.movie.getMovieImages({
            movieId: `${id}`,
          });
          return {
            logo: artworkImages?.hdmovielogo
              ?.filter(
                (logo) =>
                  is.truthy(logo.url) &&
                  is.truthy(logo.lang) &&
                  logo.lang === 'en',
              )[0]
              .url?.replace('http://', 'https://'),
            thumbnail: artworkImages?.moviethumb
              ?.filter(
                (thumb) => is.truthy(thumb.url) && thumb.lang === 'en',
              )[0]
              .url?.replace('http://', 'https://'),
            poster: artworkImages?.movieposter
              ?.filter(
                (poster) => is.truthy(poster.url) && poster.lang === 'en',
              )[0]
              .url?.replace('http://', 'https://'),
            banner: artworkImages?.moviebanner
              ?.filter(
                (banner) => is.truthy(banner.url) && banner.lang === 'en',
              )[0]
              .url?.replace('http://', 'https://'),
            background: artworkImages?.moviebackground
              ?.filter(
                (background) =>
                  is.truthy(background.url) && background.lang === 'en',
              )[0]
              .url?.replace('http://', 'https://'),
          };
        },
        this.defaultCacheTTL,
      );
      return Ok(images);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return Err(new NotFoundException('Movie artwork not found'));
        }
      }
      return Err(
        new InternalServerErrorException('Failed to get movie artwork'),
      );
    }
  }
}
