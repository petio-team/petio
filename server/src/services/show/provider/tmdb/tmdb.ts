import { Service } from 'diod';
import { Err, Ok } from 'oxide.ts';

import {
  InternalServerErrorException,
  NotFoundException,
} from '@/infrastructure/exceptions/exceptions';
import { TheMovieDatabaseApiClient } from '@/infrastructure/generated/clients';
import { ApiError } from '@/infrastructure/generated/tmdb-api-client';
import is from '@/infrastructure/utils/is';
import { toQueryString } from '@/infrastructure/utils/object-to-query-string';
import { ShowProps, ShowSeasonProps } from '@/resources/show/types';
import { CacheProvider } from '@/services/cache/cache-provider';
import {
  ShowArtworkImages,
  ShowArtworkProvider,
  ShowDiscoverProvider,
  ShowProvider,
  ShowProviderDetailsResponse,
  ShowProviderDiscoverOptions,
  ShowProviderTrendingResponse,
  ShowSeasonProviderDetailsResponse,
  ShowTrendingProvider,
} from '@/services/show/provider/provider';
import { ShowDetailsProviderResponse } from '@/services/show/provider/tmdb/types';

@Service()
export class TmdbShowProvider
  implements ShowProvider, ShowTrendingProvider, ShowDiscoverProvider
{
  /**
   * The default time-to-live (TTL) for caching movie data.
   * The value is set to 1 day (86400000 milliseconds).
   */
  private defaultCacheTTL = 86400000;

  /**
   * The base URL for retrieving original movie images from TMDB.
   */
  // private tmdbBaseImageUrl = 'https://image.tmdb.org/t/p/original';

  constructor(
    private readonly client: TheMovieDatabaseApiClient,
    private readonly cache: CacheProvider,
  ) {}

  /**
   * Builds the artwork URLs for the show based on the provided images.
   * @param images - The images object from the ShowDetailsProviderResponse.
   * @returns An object containing the URLs for the logo, poster, and background images.
   */
  private buildArtworkUrls(
    images: ShowDetailsProviderResponse['images'],
  ): ShowArtworkImages {
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
        images?.logos?.[0]?.file_path ||
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
        images?.posters?.[0]?.file_path ||
        '',
      // we want to use the first backdrop image as the background as it has no text on it
      background: images?.backdrops![0]?.file_path || '',
    };
  }

  /**
   * Retrieves the details of a specific season for a TV show from the TMDB provider.
   * @param id - The ID of the TV show.
   * @param seasonNumber - The season number.
   * @returns A promise that resolves to the details of the requested season.
   * @throws {NotFoundException} If the season is not found.
   * @throws {InternalServerErrorException} If there is an error fetching the season details.
   */
  async getSeasonDetails(
    id: number,
    seasonNumber: number,
  ): Promise<ShowSeasonProviderDetailsResponse> {
    try {
      const season = await this.cache.wrap<ShowSeasonProps>(
        `tmdb.show.${id}.season.${seasonNumber}`,
        async () => {
          const seasonDetails = await this.client.default.tvSeasonDetails({
            seriesId: id,
            seasonNumber,
          });
          return {
            name: seasonDetails.name!,
            index: seasonDetails.season_number!,
            rating: seasonDetails.vote_average,
            description: seasonDetails.overview,
            posterPath: seasonDetails.poster_path,
            episodes:
              seasonDetails.episodes?.map((episode) => ({
                index: episode.episode_number!,
                name: episode.name!,
                description: episode.overview,
                airDate: episode.air_date,
                rating: episode.vote_average,
                runtime: episode.runtime,
                stillPath: episode.still_path,
              })) || [],
          };
        },
        this.defaultCacheTTL * 7,
      );
      return Ok(season);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return Err(new NotFoundException('Season not found'));
        }
      }
      return Err(
        new InternalServerErrorException('Failed to fetch season details'),
      );
    }
  }

  /**
   * Retrieves the details of a show from the TMDB provider.
   * @param id - The ID of the show.
   * @returns A promise that resolves to the show details.
   * @throws {NotFoundException} If the show details are not found.
   * @throws {InternalServerErrorException} If there is an error fetching the show details.
   */
  async getDetails(id: number): Promise<ShowProviderDetailsResponse> {
    try {
      const details = await this.cache.wrap<ShowProps>(
        `tmdb.show.${id}`,
        async () => {
          const show = (await this.client.default.tvSeriesDetails({
            seriesId: id,
            appendToResponse: [
              'credits',
              'external_ids',
              'images',
              'recommendations',
              'similar',
              'videos',
              'aggregate_credits',
            ].join(','),
          })) as ShowDetailsProviderResponse;
          const seasonsResult = show.seasons
            ? await Promise.all(
                show.seasons
                  .filter((season) => is.truthy(season.season_number))
                  .map((season) =>
                    this.getSeasonDetails(id, season.season_number!),
                  ),
              )
            : [];
          const seasons = seasonsResult
            .filter((result) => result.isOk())
            .map((result) => result.unwrap());
          const artwork = this.buildArtworkUrls(show.images);
          return {
            title: show.name!,
            description: show.overview!,
            tagline: show.tagline!,
            certification:
              show.content_ratings?.results?.find(
                (result) => result.iso_3166_1 === 'US',
              )?.rating || '',
            duration:
              show.last_episode_to_air?.runtime ||
              show.episode_run_time?.[0] ||
              0,
            type: show.type!,
            status: show.status!,
            firstAirDate: show.first_air_date
              ? new Date(show.first_air_date)
              : undefined,
            finalAirDate: show.last_air_date
              ? new Date(show.last_air_date)
              : undefined,
            rating: {
              tmdb: show.vote_average,
            },
            language: {
              spoken:
                show.spoken_languages
                  ?.filter((lang) => is.truthy(lang.name))
                  .map((lang) => lang.name!) || [],
              original: show.original_language || '',
            },
            artwork,
            networks:
              show.networks
                ?.filter(
                  (network) => is.truthy(network.id) && is.truthy(network.name),
                )
                .map((network) => ({
                  name: network.name!,
                  logoPath: network.logo_path,
                  provider: {
                    tmdb: network.id!,
                  },
                })) || [],
            totalSeasons: show.number_of_seasons,
            totalEpisodes: show.number_of_episodes,
            seasons,
            roles: {
              creators: show.created_by
                ?.filter(
                  (creator) =>
                    is.truthy(creator.id) &&
                    is.truthy(creator.name) &&
                    is.truthy(creator.profile_path),
                )
                .map((creator) => ({
                  name: creator.name!,
                  thumbnail: creator.profile_path!,
                  providers: {
                    tmdb: creator.id!,
                  },
                })),
              executiveProducers: show.aggregate_credits?.crew
                ?.filter(
                  (crew) =>
                    is.truthy(crew.id) &&
                    is.truthy(crew.name) &&
                    is.truthy(crew.profile_path) &&
                    is.truthy(crew.jobs) &&
                    crew.department === 'Production' &&
                    is.truthy(
                      crew.jobs.find((job) => job.job === 'Executive Producer'),
                    ),
                )
                .map((producer) => ({
                  name: producer.name!,
                  thumbnail: (producer.profile_path as any)!,
                  providers: {
                    tmdb: producer.id!,
                  },
                })),
              producers: show.aggregate_credits?.crew
                ?.filter(
                  (crew) =>
                    is.truthy(crew.id) &&
                    is.truthy(crew.name) &&
                    is.truthy(crew.profile_path) &&
                    crew.department === 'Production',
                )
                .map((producer) => ({
                  name: producer.name!,
                  thumbnail: (producer.profile_path as any)!,
                  providers: {
                    tmdb: producer.id!,
                  },
                })),
              directors: show.aggregate_credits?.crew
                ?.filter(
                  (crew) =>
                    is.truthy(crew.id) &&
                    is.truthy(crew.name) &&
                    is.truthy(crew.profile_path) &&
                    is.truthy(crew.jobs) &&
                    crew.department === 'Directing' &&
                    is.truthy(crew.jobs.find((job) => job.job === 'Director')),
                )
                .map((director) => ({
                  name: director.name!,
                  thumbnail: (director.profile_path as any)!,
                  providers: {
                    tmdb: director.id!,
                  },
                })),
              writers: show.aggregate_credits?.crew
                ?.filter(
                  (crew) =>
                    is.truthy(crew.id) &&
                    is.truthy(crew.name) &&
                    is.truthy(crew.profile_path) &&
                    crew.department === 'Writing',
                )
                .map((writer) => ({
                  name: writer.name!,
                  thumbnail: (writer.profile_path as any)!,
                  providers: {
                    tmdb: writer.id!,
                  },
                })),
              actors: show.aggregate_credits?.cast
                ?.filter(
                  (cast) =>
                    is.truthy(cast.id) &&
                    is.truthy(cast.name) &&
                    is.truthy(cast.profile_path) &&
                    is.truthy(cast.roles) &&
                    cast.roles.length > 0,
                )
                .map((actor) => ({
                  name: actor.name!,
                  character: actor.roles![0].character!,
                  thumbnail: actor.profile_path!,
                  providers: {
                    tmdb: actor.id!,
                  },
                })),
            },
            countries: show.production_countries?.map((country) => ({
              name: country.name!,
              code: country.iso_3166_1!,
            })),
            genres: show.genres
              ?.filter((genre) => is.truthy(genre.id) && is.truthy(genre.name))
              .map((genre) => ({
                name: genre.name!,
                providers: {
                  tmdb: genre.id!,
                },
              })),
            recommendations: show.recommendations?.results
              ?.filter(
                (recommendation) =>
                  is.truthy(recommendation.id) &&
                  is.truthy(recommendation.name) &&
                  is.truthy(recommendation.poster_path),
              )
              .map((recommendation) => ({
                title: recommendation.name!,
                posterUrl: recommendation.poster_path!,
                providers: {
                  tmdb: recommendation.id!,
                },
              })),
            similars: show.similar?.results
              ?.filter(
                (similar) =>
                  is.truthy(similar.id) &&
                  is.truthy(similar.name) &&
                  is.truthy(similar.poster_path),
              )
              .map((similar) => ({
                title: similar.name!,
                posterUrl: similar.poster_path!,
                providers: {
                  tmdb: similar.id!,
                },
              })),
            videos: show.videos?.results
              ? {
                  trailers: show.videos.results
                    .filter(
                      (video) =>
                        video.site === 'YouTube' &&
                        video.type === 'Trailer' &&
                        is.truthy(video.key),
                    )
                    .map((video) => ({
                      key: video.key!,
                    })),
                }
              : undefined,
            providers: {
              tmdb: show.id,
              tvdb: show.external_ids?.tvdb_id,
              imdb: show.external_ids?.imdb_id,
              tvrage: show.external_ids?.tvrage_id,
            },
            source: 'tmdb',
          };
        },
        this.defaultCacheTTL * 7,
      );
      return Ok(details);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return Err(new NotFoundException('Show details not found'));
        }
      }
      return Err(
        new InternalServerErrorException('Failed to fetch show details'),
      );
    }
  }

  /**
   * Retrieves the trending TV shows from the TMDB API.
   * @returns A Promise that resolves to a ShowProviderTrendingResponse.
   */
  async getTrending(): Promise<ShowProviderTrendingResponse> {
    try {
      const trending = await this.cache.wrap<number[]>(
        'tmdb.show.trending',
        async () => {
          const results = await this.client.default.trendingTv({
            timeWindow: 'day',
          });
          return (
            results.results
              ?.filter((show) => is.truthy(show.id))
              ?.map((show) => show.id!) || []
          );
        },
        this.defaultCacheTTL,
      );
      return Ok(trending);
    } catch (error) {
      return Err(
        new InternalServerErrorException('Failed to fetch trending shows'),
      );
    }
  }

  /**
   * Retrieves the discoverable TV shows from the TMDB API.
   * @returns A Promise that resolves to a ShowProviderDiscoverResponse.
   */
  async getDiscover(
    options?: ShowProviderDiscoverOptions,
  ): Promise<ShowProviderTrendingResponse> {
    try {
      const optionsAsString =
        options && Object.keys(options).length ? toQueryString(options) : '';
      const discover = await this.cache.wrap<number[]>(
        `tmdb.show.discover${optionsAsString}`,
        async () => {
          const data = await this.client.default.discoverTv({
            page: options?.page || 1,
            withNetworks: options?.withNetworkId,
            withGenres: options?.withGenreId?.toString(),
          });
          return (
            data.results
              ?.filter((show) => is.truthy(show.id))
              ?.map((show) => show.id!) || []
          );
        },
        this.defaultCacheTTL,
      );
      return Ok(discover);
    } catch (error) {
      return Err(
        new InternalServerErrorException('Failed to fetch discoverable shows'),
      );
    }
  }
}
