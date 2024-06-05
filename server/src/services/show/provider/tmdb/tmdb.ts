import { Service } from 'diod';
import { Err, Ok } from 'oxide.ts';

import {
  InternalServerErrorException,
  NotFoundException,
} from '@/infrastructure/exceptions/exceptions';
import { ApiError, TheMovieDatabaseClient } from '@/infrastructure/tmdb/client';
import is from '@/infrastructure/utils/is';
import { ShowProps, ShowSeasonProps } from '@/resources/show/types';
import { CacheService } from '@/services/cache/cache';
import {
  ShowArtworkImages,
  ShowProvider,
  ShowProviderDetailsResponse,
  ShowSeasonProviderDetailsResponse,
} from '@/services/show/provider/provider';
import { ShowDetailsProviderResponse } from '@/services/show/provider/tmdb/types';

@Service()
export class TmdbShowProvider implements ShowProvider {
  /**
   * The default time-to-live (TTL) for caching movie data.
   * The value is set to 1 day (86400000 milliseconds).
   */
  private defaultCacheTTL = 86400000;

  /**
   * The base URL for retrieving original movie images from TMDB.
   */
  private tmdbBaseImageUrl = 'https://image.tmdb.org/t/p/original';

  constructor(
    private readonly client: TheMovieDatabaseClient,
    private readonly cache: CacheService,
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
        this.defaultCacheTTL,
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
                  (creator) => is.truthy(creator.id) && is.truthy(creator.name),
                )
                .map((creator) => ({
                  name: creator.name!,
                  thumbnail: this.tmdbBaseImageUrl + creator.profile_path,
                  providers: {
                    tmdb: creator.id!,
                  },
                })),
              executiveProducers: show.credits?.crew
                ?.filter(
                  (crew) =>
                    is.truthy(crew.id) &&
                    is.truthy(crew.name) &&
                    crew.job === 'Executive Producer',
                )
                .map((producer) => ({
                  name: producer.name!,
                  thumbnail: this.tmdbBaseImageUrl + producer.profile_path,
                  providers: {
                    tmdb: producer.id!,
                  },
                })),
              producers: show.credits?.crew
                ?.filter(
                  (crew) =>
                    is.truthy(crew.id) &&
                    is.truthy(crew.name) &&
                    crew.job === 'Producer',
                )
                .map((producer) => ({
                  name: producer.name!,
                  thumbnail: this.tmdbBaseImageUrl + producer.profile_path,
                  providers: {
                    tmdb: producer.id!,
                  },
                })),
              directors: show.credits?.crew
                ?.filter(
                  (crew) =>
                    is.truthy(crew.id) &&
                    is.truthy(crew.name) &&
                    crew.job === 'Director',
                )
                .map((director) => ({
                  name: director.name!,
                  thumbnail: this.tmdbBaseImageUrl + director.profile_path,
                  providers: {
                    tmdb: director.id!,
                  },
                })),
              writers: show.credits?.crew
                ?.filter(
                  (crew) =>
                    is.truthy(crew.id) &&
                    is.truthy(crew.name) &&
                    crew.job === 'Writer',
                )
                .map((writer) => ({
                  name: writer.name!,
                  thumbnail: this.tmdbBaseImageUrl + writer.profile_path,
                  providers: {
                    tmdb: writer.id!,
                  },
                })),
              authors: show.credits?.crew
                ?.filter(
                  (crew) =>
                    is.truthy(crew.id) &&
                    is.truthy(crew.name) &&
                    crew.job === 'Author',
                )
                .map((author) => ({
                  name: author.name!,
                  thumbnail: this.tmdbBaseImageUrl + author.profile_path,
                  providers: {
                    tmdb: author.id!,
                  },
                })),
              actors: show.credits?.cast
                ?.filter(
                  (cast) =>
                    is.truthy(cast.id) &&
                    is.truthy(cast.name) &&
                    is.truthy(cast.character),
                )
                .map((actor) => ({
                  name: actor.name!,
                  character: actor.character!,
                  thumbnail: this.tmdbBaseImageUrl + actor.profile_path,
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
                posterUrl: this.tmdbBaseImageUrl + recommendation.poster_path!,
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
                posterUrl: this.tmdbBaseImageUrl + similar.poster_path!,
                providers: {
                  tmdb: similar.id!,
                },
              })),
            videos: show.videos?.results
              ? {
                  trailers: show.videos.results
                    .filter(
                      (video) =>
                        video.site === 'Youtube' &&
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
        this.defaultCacheTTL,
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
}
