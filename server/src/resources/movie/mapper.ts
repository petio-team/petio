/* eslint-disable no-underscore-dangle */
import { Service } from 'diod';

import { Mapper } from '@/infrastructure/entity/mapper';
import is from '@/infrastructure/utils/is';
import { MovieResponseProps } from '@/resources/movie/response';
import { MetadataSources } from '@/resources/movie/types';
import getLanguage from '@/services/tmdb/languages';

import { MovieEntity } from './entity';
import { MovieSchemaProps } from './schema';

/**
 * Mapper class for converting between MovieEntity and MovieSchemaProps.
 */
@Service()
export class MovieMapper
  implements Mapper<MovieEntity, MovieSchemaProps, MovieResponseProps>
{
  /**
   * Converts a MovieEntity to a MovieSchemaProps.
   * @param entity - The entity to convert.
   * @returns The converted entity.
   */
  toPeristence(entity: MovieEntity): MovieSchemaProps {
    const copy = entity.getProps();
    return {
      _id: copy.id,
      title: copy.title,
      ratingKey: copy.providers.plex?.id || 0,
      key: '', // TODO remove unused property
      guid: '', // TODO remove unused property
      studio: copy.studios[0].name,
      type: '',
      titleSort: '', // TODO remove unused property
      contentRating: copy.certification || '',
      summary: copy.description,
      index: -1, // TODO remove unused property
      rating: copy.rating.tmdb || 0,
      year: copy.releaseDate.getFullYear(),
      tagline: copy.tagline,
      thumb: copy.artwork.thumbnail || '',
      art: '', // TODO remove unused property
      banner: '', // TODO remove unused property
      theme: '', // TODO remove unused property
      duration: copy.duration,
      originallyAvailableAt: '', // TODO remove unused property
      leafCount: 0, // TODO remove unused property
      viewedLeafCount: 0, // TODO remove unused property
      childCount: 0, // TODO remove unused property
      addedAt: copy.createdAt.getTime(),
      updatedAt: copy.updatedAt.getTime(),
      primaryExtraKey: '', // TODO remove unused property
      ratingImage: '', // TODO remove unused property
      Media:
        copy.resources?.map((resource) => ({
          ratingKey: resource.providers?.plex?.id || 0,
          videoResolution: resource.resolution,
        })) || [],
      Genre:
        copy.genres?.map((genre) => ({
          id: genre.providers?.plex?.id || genre.providers?.tmdb?.id || 0,
          tag: genre.name,
          filter: '',
        })) || [],
      Director:
        copy.roles?.directors.map((director) => ({
          id: director.providers?.plex?.id || director.providers?.tmdb?.id || 0,
          tag: director.name,
        })) || [],
      Writer:
        copy.roles?.writers.map((writer) => ({
          id: writer.providers?.plex?.id || writer.providers?.tmdb?.id || 0,
          tag: writer.name,
        })) || [],
      Country:
        copy.countries?.map((country) => ({
          id: 0,
          tag: country.name,
        })) || [],
      Role:
        copy.roles?.actors.map((actor) => ({
          id: actor.providers?.plex?.id || actor.providers?.tmdb?.id || 0,
          name: actor.name,
          character: actor.character,
        })) || [],
      idSource: copy.source,
      externalId: '', // TODO remove unused property
      imdb_id: copy.providers.imdb ? `${copy.providers.imdb.id}` : '',
      tmdb_id: copy.providers.tmdb ? `${copy.providers.tmdb.id}` : '',
      petioTimestamp: copy.updatedAt,
    };
  }

  /**
   * Converts a MovieSchemaProps to a MovieEntity.
   * @param record - The record to convert.
   * @returns The converted record.
   */
  toEntity(record: MovieSchemaProps): MovieEntity {
    return new MovieEntity({
      id: record._id,
      props: {
        title: record.title,
        description: record.summary,
        rating: {
          tmdb: record.rating,
        },
        tagline: record.tagline,
        duration: record.duration,
        releaseDate: new Date(record.year),
        budget: 0,
        revenue: 0,
        artwork: {
          thumbnail: record.thumb,
        },
        studios: [
          {
            name: record.studio,
            logoPath: '',
          },
        ],
        roles: {
          directors: record.Director.filter((director) =>
            is.truthy(director.tag),
          ).map((director) => ({
            name: director.tag || '',
            thumbnail: director.thumb || '',
            providers: {
              plex: {
                id: director.id || 0,
              },
            },
          })),
          writers: record.Writer.filter((writer) => is.truthy(writer.tag)).map(
            (writer) => ({
              name: writer.tag || '',
              thumbnail: writer.thumb || '',
              providers: {
                plex: {
                  id: writer.id || 0,
                },
              },
            }),
          ),
          actors: record.Role.filter((role) => is.truthy(role.tag)).map(
            (actor) => ({
              name: actor.tag || '',
              character: actor.role || '',
              thumbnail: actor.thumb || '',
              providers: {
                plex: {
                  id: actor.id || 0,
                },
              },
            }),
          ),
          authors: [],
          producers: [],
          executiveProducers: [],
        },
        genres: record.Genre.filter((genre) => is.truthy(genre.tag)).map(
          (genre) => ({
            name: genre.tag || '',
            providers: {
              plex: {
                id: genre.id || 0,
              },
            },
          }),
        ),
        countries: record.Country.filter((country) =>
          is.truthy(country.tag),
        ).map((country) => ({
          name: country.tag || '',
          code: '',
        })),
        resources: record.Media.map((media) => ({
          resolution: media.videoResolution,
          path: '',
          providers: {
            plex: {
              id: media.ratingKey,
            },
          },
        })),
        providers: {
          plex: {
            id: record.ratingKey,
          },
          tmdb: {
            id: record.tmdb_id ? parseInt(record.tmdb_id, 10) : 0,
          },
          imdb: {
            id: record.imdb_id ? parseInt(record.imdb_id, 10) : 0,
          },
        },
        source: record.idSource as MetadataSources,
      },
      createdAt: new Date(),
      updatedAt: new Date(record.updatedAt),
    });
  }

  /**
   * Converts a MovieEntity to a response object.
   * @param entity - The entity to convert.
   * @returns The converted response.
   */
  toResponse(entity: MovieEntity): MovieResponseProps {
    const copy = entity.getProps();
    return {
      id: copy.providers.tmdb?.id.toString() || '',
      title: copy.title,
      tagline: copy.tagline,
      overview: copy.description,
      backdrop_path: copy.artwork.background || '',
      status: copy.releaseStatus,
      budget: copy.budget,
      revenue: copy.revenue,
      vote_average: copy.rating.tmdb,
      release_date: copy.releaseDate.toString(),
      runtime: copy.duration,
      original_language: copy.language?.original,
      original_language_format: copy.language?.original
        ? getLanguage(copy.language.original)
        : '',
      age_rating: copy.certification,
      logo: copy.artwork.logo || '',
      poster_path: copy.artwork.poster || '',
      imdb_id: copy.providers.imdb ? copy.providers.imdb.id.toString() : '',
      tmdb_id: copy.providers.tmdb ? copy.providers.tmdb.id.toString() : '',
      belongs_to_collection: copy.collections
        ? {
            name: copy.collections.name,
          }
        : undefined,
      collection: copy.collections?.movies.map((movie) => ({
        id: `${movie.providers?.plex?.id || movie.providers?.tmdb?.id || 0}`,
        name: movie.name,
        poster_path: movie.posterUrl || '',
      })),
      recommendations: copy.recommendations?.map((recommendation) => ({
        id: `${
          recommendation.providers?.plex?.id ||
          recommendation.providers?.tmdb?.id ||
          0
        }`,
        title: recommendation.title,
        poster_path: recommendation.posterUrl || '',
      })),
      on_server: copy.providers.plex?.id
        ? {
            serverKey: copy.providers.plex.clientId || '',
            versions:
              copy.resources?.map((resource) => ({
                ratingKey: resource.providers?.plex?.id || 0,
                resolution: resource.resolution,
              })) || [],
          }
        : false,
      available_resolutions: copy.resources?.map(
        (resource) => resource.resolution,
      ),
      imdb_data: copy.rating.imdb
        ? {
            rating: {
              ratingValue: copy.rating.imdb,
            },
          }
        : undefined,
      spoken_languages: copy.language?.spoken.map((language) => ({
        name: language,
      })),
      production_companies: copy.studios
        .filter((studio) => is.truthy(studio.providers?.tmdb?.id))
        .map((studio) => ({
          id: studio.providers?.tmdb?.id || 0,
          name: studio.name,
        })),
      credits: {
        cast:
          copy.roles?.actors.map((actor) => ({
            id: actor.providers?.tmdb?.id || 0,
            character: actor.character,
            name: actor.name,
            profile_path: actor.thumbnail || '',
          })) || [],
        crew: [
          ...(copy.roles?.directors.map((director) => ({
            id: director.providers?.tmdb?.id || 0,
            job: 'Director',
            name: director.name,
            profile_path: director.thumbnail || '',
          })) || []),
          ...(copy.roles?.authors.map((author) => ({
            id: author.providers?.tmdb?.id || 0,
            job: 'Author',
            name: author.name,
            profile_path: author.thumbnail || '',
          })) || []),
          ...(copy.roles?.writers.map((writer) => ({
            id: writer.providers?.tmdb?.id || 0,
            job: 'Writer',
            name: writer.name,
            profile_path: writer.thumbnail || '',
          })) || []),
          ...(copy.roles?.producers.map((producer) => ({
            id: producer.providers?.tmdb?.id || 0,
            job: 'Producer',
            name: producer.name,
            profile_path: producer.thumbnail || '',
          })) || []),
          ...(copy.roles?.executiveProducers.map((producer) => ({
            id: producer.providers?.tmdb?.id || 0,
            job: 'Executive Producer',
            name: producer.name,
            profile_path: producer.thumbnail || '',
          })) || []),
        ],
      },
      genres:
        copy.genres
          ?.filter((genre) => is.truthy(genre.providers?.tmdb?.id))
          .map((genre) => ({
            id: genre.providers?.tmdb?.id || 0,
          })) || [],
      keywords:
        copy.keywords
          ?.filter((keyword) => is.truthy(keyword.providers?.tmdb?.id))
          .map((keyword) => ({
            id: keyword.providers?.tmdb?.id?.toString() || '',
          })) || [],
      videos: copy.videos
        ? {
            results: copy.videos.trailers.map((video) => ({
              key: video.key,
            })),
          }
        : undefined,
    };
  }
}
