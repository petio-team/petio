import { Service } from 'diod';
import { Err, Ok } from 'oxide.ts';

import {
  InternalServerErrorException,
  NotFoundException,
} from '@/infrastructure/exceptions/exceptions';
import { ApiError, TheMovieDatabaseClient } from '@/infrastructure/tmdb/client';
import is from '@/infrastructure/utils/is';
import { CacheService } from '@/services/cache/cache';
import {
  MovieArtworkImages,
  MovieProvider,
  MovieProviderCollectionDetailsResponse,
  MovieProviderDetailsResponse,
} from '@/services/movie/provider/provider';
import { MovieLookupProviderResponse } from '@/services/movie/provider/tmdb/types';

import { MetadataSources } from '../../../../resources/movie/types';

@Service()
export class TmdbMovieProvider implements MovieProvider {
  /**
   * The base URL for retrieving original movie images from TMDB.
   */
  private tmdbBaseImageUrl = 'https://image.tmdb.org/t/p/original';

  constructor(
    private readonly client: TheMovieDatabaseClient,
    private readonly cache: CacheService,
  ) {}

  /**
   * Builds the artwork URLs for a movie based on the provided images.
   * @param images - The images object from the MovieLookupProviderResponse.
   * @returns The movie artwork images object containing the logo, poster, and background URLs.
   */
  private buildArtworkUrls(
    images: MovieLookupProviderResponse['images'],
  ): MovieArtworkImages {
    return {
      logo: images?.logos
        ?.filter(
          (logo) =>
            is.truthy(logo.file_path) &&
            is.truthy(logo.iso_639_1) &&
            logo.iso_639_1 === 'en',
        )
        .map((logo) => ({
          file_path: this.tmdbBaseImageUrl + logo.file_path,
        }))[0].file_path,
      poster: images?.posters
        ?.filter(
          (poster) => is.truthy(poster.file_path) && poster.iso_639_1 === 'en',
        )
        .map((logo) => ({
          file_path: this.tmdbBaseImageUrl + logo.file_path,
        }))[0].file_path,
      background: images?.backdrops
        ?.filter((bg) => is.truthy(bg.file_path) && bg.iso_639_1 === 'en')
        .map((logo) => ({
          file_path: this.tmdbBaseImageUrl + logo.file_path,
        }))[0].file_path,
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
          title: detailsResult.title || '',
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
              logoPath: c.logo_path ? this.tmdbBaseImageUrl + c.logo_path : '',
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
                  thumbnail: c.profile_path
                    ? this.tmdbBaseImageUrl + c.profile_path
                    : '',
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
                  thumbnail: c.profile_path
                    ? this.tmdbBaseImageUrl + c.profile_path
                    : '',
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
                  thumbnail: c.profile_path
                    ? this.tmdbBaseImageUrl + c.profile_path
                    : '',
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
                  thumbnail: c.profile_path
                    ? this.tmdbBaseImageUrl + c.profile_path
                    : '',
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
                  thumbnail: c.profile_path
                    ? this.tmdbBaseImageUrl + c.profile_path
                    : '',
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
                thumbnail: c.profile_path
                  ? this.tmdbBaseImageUrl + c.profile_path
                  : '',
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
            posterUrl: m.poster_path
              ? this.tmdbBaseImageUrl + m.poster_path
              : '',
            providers: {
              tmdb: {
                id: m.id!,
              },
            },
          })),
          recommendations: detailsResult.recommendations?.results.map((m) => ({
            title: m.title!,
            posterUrl: m.poster_path
              ? this.tmdbBaseImageUrl + m.poster_path
              : '',
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
                posterUrl: m.poster_path
                  ? this.tmdbBaseImageUrl + m.poster_path
                  : '',
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
}
