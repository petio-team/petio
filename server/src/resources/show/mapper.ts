/* eslint-disable no-underscore-dangle */
import { Service } from 'diod';

import { Mapper } from '@/infrastructure/entity/mapper';
import { ShowResponseProps } from '@/resources/show/response';

import { ShowEntity } from './entity';
import { ShowSchemaProps } from './schema';

/**
 * Mapper class for converting between ShowEntity and ShowSchemaProps.
 */
@Service()
export class ShowMapper
  implements Mapper<ShowEntity, ShowSchemaProps, ShowResponseProps>
{
  /**
   * Converts a ShowEntity to a ShowSchemaProps.
   * @param entity - The entity to convert.
   * @returns The converted entity.
   */
  toPeristence(entity: ShowEntity): ShowSchemaProps {
    const copy = entity.getProps();
    return {
      _id: copy.id,
      title: copy.title,
      summary: copy.description,
      contentRating: copy.certification || '',
      duration: copy.duration,
      type: copy.type || '',
      originallyAvailableAt: copy.firstAirDate?.toISOString() || '',
      ratingKey: copy.providers.plex || 0,
      key: '',
      guid: '',
      studio: copy.networks?.at(0)?.name || '',
      titleSort: '',
      index: -1,
      rating: copy.rating.tmdb || 0,
      year: copy.firstAirDate?.getFullYear() || new Date().getFullYear(),
      thumb: copy.artwork.thumbnail || '',
      art: copy.artwork.poster || '',
      banner: copy.artwork.banner || '',
      theme: '',
      leafCount: 0,
      viewedLeafCount: 0,
      childCount: 0,
      addedAt: copy.createdAt.getTime(),
      updatedAt: copy.updatedAt.getTime(),
      Genre: copy.genres?.map((genre) => ({ id: 0, name: genre.name })) || [],
      idSource: copy.source,
      externalId: '',
      tvdb_id: copy.providers.tvdb?.toString() || '',
      imdb_id: copy.providers.imdb?.toString() || '',
      tmdb_id: copy.providers.tmdb?.toString() || '',
      petioTimestamp: copy.updatedAt,
      seasonData: copy.seasons.map((season) => ({
        seasonNumber: season.index,
        title: season.name,
        episodes: season.episodes.map((episode) => ({
          title: episode.name,
          episodeNumber: episode.index,
          resolution: episode.resources?.at(0)?.resolution || '',
          videoCodec: '',
          audioCodec: '',
        })),
      })),
    };
  }

  /**
   * Converts a ShowSchemaProps to a ShowEntity.
   * @param record - The record to convert.
   * @returns The converted record.
   */
  toEntity(record: ShowSchemaProps): ShowEntity {
    return new ShowEntity({
      id: record._id,
      props: {
        title: record.title,
        description: record.summary,
        certification: record.contentRating,
        duration: record.duration,
        type: record.type,
        firstAirDate: new Date(record.originallyAvailableAt),
        rating: { tmdb: record.rating },
        artwork: {
          thumbnail: record.thumb,
          poster: record.art,
          banner: record.banner,
        },
        networks: [{ name: record.studio }],
        genres: record.Genre.map((genre) => ({ name: genre.name })),
        source: record.idSource,
        providers: {
          plex: record.ratingKey,
          tvdb: parseInt(record.tvdb_id, 10),
          imdb: record.imdb_id,
          tmdb: parseInt(record.tmdb_id, 10),
        },
        seasons: record.seasonData.map((season) => ({
          index: season.seasonNumber,
          name: season.title,
          episodes: season.episodes.map((episode) => ({
            index: episode.episodeNumber,
            name: episode.title,
            resources: [
              {
                resolution: episode.resolution || '',
              },
            ],
          })),
        })),
      },
      createdAt: new Date(),
      updatedAt: new Date(record.updatedAt),
    });
  }

  /**
   * Converts a ShowEntity to a response object.
   * @param entity - The entity to convert.
   * @returns The converted response.
   */
  toResponse(entity: ShowEntity): ShowResponseProps {
    const copy = entity.getProps();
    return {
      id: copy.providers.tmdb?.toString() || '',
      name: copy.title,
      type: copy.type || '',
      tagline: copy.tagline || '',
      overview: copy.description,
      backdrop_path: copy.artwork.background || '',
      original_language: copy.language?.original || '',
      status: copy.status || '',
      age_rating: copy.certification || '',
      first_air_date: copy.firstAirDate?.toISOString(),
      last_air_date: copy.finalAirDate?.toISOString(),
      vote_average: copy.rating.tmdb || 0,
      episode_run_time: [],
      number_of_episodes: copy.totalEpisodes || 0,
      number_of_seasons: copy.totalSeasons || 0,
      logo: copy.artwork.logo || '',
      tile: copy.artwork.poster || '',
      original_language_format: copy.language?.original || '',
      imdb_id: copy.providers.imdb?.toString() || '',
      tmdb_id: copy.providers.tmdb?.toString() || '',
      seasons: copy.seasons.map((season) => ({
        name: season.name,
        season_number: season.index,
      })),
      seasonData: copy.seasons.map((season) => ({
        season_number: season.index,
        name: season.name,
        episodes: season.episodes.map((episode) => ({
          episode_number: episode.index,
          air_date: episode.airDate || '',
          overview: episode.description || '',
        })),
      })),
      created_by:
        copy.roles?.creators?.map((creator) => ({
          id: creator.providers.tmdb || 0,
          name: creator.name,
          profile_path: creator.thumbnail,
        })) || [],
      spoken_languages: copy.language?.spoken.map((language) => ({
        name: language,
      })),
      networks:
        copy.networks?.map((network) => ({
          id: network.provider?.tmdb || 0,
          name: network.name,
        })) || [],
      genres:
        copy.genres?.map((genre) => ({
          id: genre.providers?.tmdb?.toString() || '',
        })) || [],
      keywords:
        copy.keywords?.map((keyword) => ({
          id: keyword.providers?.tmdb?.toString() || '',
        })) || [],
      videos: copy.videos
        ? {
            results: copy.videos.trailers.map((video) => ({
              key: video.key,
            })),
          }
        : undefined,
      recommendations:
        copy.recommendations?.map((recommendation) => ({
          id: recommendation.providers.tmdb || 0,
          title: recommendation.title,
          poster_path: recommendation.posterUrl,
        })) || [],
      on_server: {
        serverKey: '',
        versions: [],
      },
    };
  }
}
