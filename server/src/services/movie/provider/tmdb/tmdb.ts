import { Service } from 'diod';
import { Err, Ok } from 'oxide.ts';
import pino from 'pino';

import {
  InternalServerErrorException,
  NotFoundException,
} from '@/infrastructure/exceptions/exceptions';
import { TheMovieDatabaseApiClient } from '@/infrastructure/generated/clients';
import { ApiError } from '@/infrastructure/generated/tmdb-api-client';
import { Logger } from '@/infrastructure/logger/logger';
import is from '@/infrastructure/utils/is';
import { toQueryString } from '@/infrastructure/utils/object-to-query-string';
import { CacheProvider } from '@/services/cache/cache-provider';
import {
  MovieArtworkImages,
  MovieDiscoverOptions,
  MovieDiscoverProvider,
  MovieDiscoverResponse,
  MovieProvider,
  MovieProviderCollectionDetailsResponse,
  MovieProviderDetailsResponse,
  MovieTrendingProvider,
  MovieTrendingResponse,
} from '@/services/movie/provider/provider';
import { MovieLookupProviderResponse } from '@/services/movie/provider/tmdb/types';

import { MetadataSources } from '../../../../resources/movie/types';

@Service()
export class TmdbMovieProvider
  implements MovieProvider, MovieTrendingProvider, MovieDiscoverProvider
{
  /**
   * The base URL for retrieving original movie images from TMDB.
   */
  // private tmdbBaseImageUrl = 'https://image.tmdb.org/t/p/original';

  private logger: pino.Logger;

  constructor(
    logger: Logger,
    private readonly client: TheMovieDatabaseApiClient,
    private readonly cache: CacheProvider,
  ) {
    this.logger = logger.child({
      module: 'services.movie.provider.tmdb',
    });
  }

  /**
   * Builds the artwork URLs for a movie based on the provided images.
   * @param images - The images object from the MovieLookupProviderResponse.
   * @returns The movie artwork images object containing the logo, poster, and background URLs.
   */
  private buildArtworkUrls(
    images: MovieLookupProviderResponse['images'],
  ): MovieArtworkImages {
    return {
      logo:
        images?.logos
          ?.filter(
            (logo) =>
              is.truthy(logo.file_path) &&
              is.truthy(logo.iso_639_1) &&
              logo.iso_639_1 === 'en',
          )
          .map((logo) => ({
            file_path: logo.file_path,
          }))[0]?.file_path ||
        images?.logos[0]?.file_path ||
        '',
      poster:
        images?.posters
          ?.filter(
            (poster) =>
              is.truthy(poster.file_path) && poster.iso_639_1 === 'en',
          )
          .map((logo) => ({
            file_path: logo.file_path,
          }))[0]?.file_path ||
        images?.posters[0]?.file_path ||
        '',
      // we want to use the first backdrop image as the background as it has no text on it
      background: images?.backdrops[0]?.file_path || '',
    };
  }

  /**
   * Retrieves the details of a movie from the TMDB provider.
   * @param id - The ID of the movie.
   * @returns A promise that resolves to the movie details or rejects with an error.
   */
  async getDetails(id: number): Promise<MovieProviderDetailsResponse> {
    try {
      const details = await this.cache.wrap(`tmdb.movie.${id}`, async () => {
        const detailsResult = (await this.client.default.movieDetails({
          movieId: id,
          appendToResponse: [
            'credits',
            'keywords',
            'videos',
            'images',
            'similar',
            'release_dates',
            'recommendations',
          ].join(','),
        })) as MovieLookupProviderResponse;
        const collections = detailsResult.belongs_to_collection?.id
          ? (
              await this.getCollectionDetails(
                detailsResult.belongs_to_collection.id,
              )
            ).unwrapOr(undefined)
          : undefined;
        const images = this.buildArtworkUrls(detailsResult.images);
        return {
          title: detailsResult.title || detailsResult.original_title || '',
          description: detailsResult.overview || '',
          certification:
            detailsResult.release_dates?.results.find(
              (r) => r.iso_3166_1 === 'US',
            )?.release_dates[0].certification || '',
          tagline: detailsResult.tagline || '',
          duration: detailsResult.runtime || 0,
          releaseDate: new Date(detailsResult.release_date!),
          releaseStatus: detailsResult.status || '',
          budget: detailsResult.budget,
          revenue: detailsResult.revenue,
          rating: {
            tmdb: detailsResult.vote_average,
          },
          language: {
            spoken: detailsResult.spoken_languages?.map((l) => l.name!) || [],
            original: detailsResult.original_language || '',
          },
          artwork: {
            logo: images.logo,
            thumbnail: images.thumbnail,
            poster: images.poster,
            banner: images.banner,
            background: images.background,
          },
          studios:
            detailsResult.production_companies?.map((c) => ({
              name: c.name!,
              logoPath: c.logo_path ? c.logo_path : '',
              providers: {
                tmdb: {
                  id: c.id!,
                },
              },
            })) || [],
          roles: {
            executiveProducers:
              detailsResult.credits?.crew
                .filter((c) => c.job === 'Executive Producer')
                .map((c) => ({
                  name: c.name!,
                  thumbnail: c.profile_path ? c.profile_path : '',
                  providers: {
                    tmdb: {
                      id: c.id!,
                    },
                  },
                })) || [],
            producers:
              detailsResult.credits?.crew
                .filter((c) => c.job === 'Producer')
                .map((c) => ({
                  name: c.name!,
                  thumbnail: c.profile_path ? c.profile_path : '',
                  providers: {
                    tmdb: {
                      id: c.id!,
                    },
                  },
                })) || [],
            directors:
              detailsResult.credits?.crew
                .filter((c) => c.job === 'Director')
                .map((c) => ({
                  name: c.name!,
                  thumbnail: c.profile_path ? c.profile_path : '',
                  providers: {
                    tmdb: {
                      id: c.id!,
                    },
                  },
                })) || [],
            authors:
              detailsResult.credits?.crew
                .filter((c) => c.job === 'Author')
                .map((c) => ({
                  name: c.name!,
                  thumbnail: c.profile_path ? c.profile_path : '',
                  providers: {
                    tmdb: {
                      id: c.id!,
                    },
                  },
                })) || [],
            writers:
              detailsResult.credits?.crew
                .filter((c) => c.job === 'Writer')
                .map((c) => ({
                  name: c.name!,
                  thumbnail: c.profile_path ? c.profile_path : '',
                  providers: {
                    tmdb: {
                      id: c.id!,
                    },
                  },
                })) || [],
            actors:
              detailsResult.credits?.cast.map((c) => ({
                name: c.name!,
                character: c.character!,
                thumbnail: c.profile_path ? c.profile_path : '',
                providers: {
                  tmdb: {
                    id: c.id!,
                  },
                },
              })) || [],
          },
          countries: detailsResult.production_countries?.map((c) => ({
            name: c.name!,
            code: c.iso_3166_1!,
          })),
          keywords: detailsResult.keywords?.keywords.map((k) => ({
            name: k.name!,
            providers: {
              tmdb: {
                id: k.id,
              },
            },
          })),
          genres: detailsResult.genres?.map((g) => ({
            name: g.name!,
            providers: {
              tmdb: {
                id: g.id!,
              },
            },
          })),
          videos: detailsResult.videos?.results
            ? {
                trailers: detailsResult.videos.results
                  .filter((v) => v.site === 'YouTube' && v.type === 'Trailer')
                  .map((v) => ({
                    key: v.key,
                  })),
              }
            : undefined,
          collections,
          similars: detailsResult.similar?.results.map((m) => ({
            title: m.title!,
            posterUrl: m.poster_path ? m.poster_path : '',
            providers: {
              tmdb: {
                id: m.id!,
              },
            },
          })),
          recommendations: detailsResult.recommendations?.results.map((m) => ({
            title: m.title!,
            posterUrl: m.poster_path ? m.poster_path : '',
            providers: {
              tmdb: {
                id: m.id!,
              },
            },
          })),
          providers: {
            tmdb: {
              id: detailsResult.id!,
            },
            imdb: detailsResult.imdb_id
              ? {
                  id: parseInt(detailsResult.imdb_id, 10),
                }
              : undefined,
          },
          source: 'tmdb' as MetadataSources,
        };
      });
      return Ok(details);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return Err(new NotFoundException('Movie not found'));
        }
      }
      return Err(
        new InternalServerErrorException('Failed to fetch movie details'),
      );
    }
  }

  /**
   * Retrieves the details of a movie collection from the TMDB provider.
   * @param id - The ID of the movie collection.
   * @returns A promise that resolves to the movie collection details.
   * @throws {NotFoundException} If the collection is not found.
   * @throws {InternalServerErrorException} If there is an error fetching the collection details.
   */
  private async getCollectionDetails(
    id: number,
  ): Promise<MovieProviderCollectionDetailsResponse> {
    try {
      const collection = await this.cache.wrap(
        `tmdb.collection.${id}`,
        async () => {
          const collectionResult = await this.client.default.collectionDetails({
            collectionId: id,
          });
          return {
            name: collectionResult.name!,
            movies:
              collectionResult.parts?.map((m) => ({
                name: m.title!,
                posterUrl: m.poster_path ? m.poster_path : '',
                providers: {
                  tmdb: {
                    id: m.id!,
                  },
                },
              })) || [],
            providers: {
              tmdb: {
                id: collectionResult.id!,
              },
            },
          };
        },
      );
      return Ok(collection);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return Err(new NotFoundException('Collection not found'));
        }
      }
      return Err(
        new InternalServerErrorException('Failed to fetch collection details'),
      );
    }
  }

  /**
   * Retrieves the trending movies from the TMDB provider.
   * @returns A promise that resolves to the trending movies.
   */
  async getTrending(): Promise<MovieTrendingResponse> {
    try {
      const results = await this.cache.wrap('tmdb.movie.trending', async () => {
        const data = await this.client.default.trendingMovies({
          timeWindow: 'day',
        });
        return (
          data.results
            ?.filter((movie) => is.truthy(movie.id))
            ?.map((movie) => movie.id!) || []
        );
      });
      return Ok(results);
    } catch (error) {
      this.logger.error(error, 'Failed to fetch trending movies');
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return Err(new NotFoundException('Trending movies not found'));
        }
      }
      return Err(
        new InternalServerErrorException('Failed to fetch trending movies'),
      );
    }
  }

  /**
   * Retrieves a list of discoverable movies based on the provided options.
   * @param options - The options to customize the movie discovery.
   * @returns A promise that resolves to a MovieDiscoverResponse containing the list of discoverable movies.
   */
  async getDiscover(
    options?: MovieDiscoverOptions,
  ): Promise<MovieDiscoverResponse> {
    try {
      const optionsAsString =
        options && Object.keys(options).length ? toQueryString(options) : '';
      const results = await this.cache.wrap(
        `tmdb.movie.discover${optionsAsString}`,
        async () => {
          const data = await this.client.default.discoverMovie({
            page: options?.page || 1,
            withCompanies: options?.withCompanyId?.toString(),
          });
          return (
            data.results
              ?.filter((movie) => is.truthy(movie.id))
              ?.map((movie) => movie.id!) || []
          );
        },
      );
      return Ok(results);
    } catch (error) {
      return Err(
        new InternalServerErrorException('Failed to fetch discoverable movies'),
      );
    }
  }
}
