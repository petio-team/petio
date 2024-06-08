import { Service } from 'diod';

import { Mapper } from '@/infrastructure/entity/mapper';
import { PersonResponseProps } from '@/resources/person/response';
import { PersonGender } from '@/resources/person/types';

import { PersonEntity } from './entity';

/**
 * Mapper class for converting between PersonEntity and PersonSchemaProps.
 */
@Service()
export class PersonMapper
  implements Mapper<PersonEntity, any, PersonResponseProps>
{
  /**
   * Converts a PersonEntity to a PersonSchemaProps.
   * @param entity - The entity to convert.
   * @returns The converted entity.
   */
  toPeristence(entity: PersonEntity): unknown {
    const copy = entity.getProps();
    return {
      id: copy.id,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }

  /**
   * Converts a PersonSchemaProps to a PersonEntity.
   * @param record - The record to convert.
   * @returns The converted record.
   */
  toEntity(record: any): PersonEntity {
    return new PersonEntity({
      id: record.id,
      props: {
        name: '',
        gender: PersonGender.Other,
        role: '',
        bio: '',
        birthDate: '',
        deathDate: '',
        popularity: {
          tmdb: 0,
        },
        artwork: {
          poster: {
            url: '',
            source: '',
          },
        },
        media: {
          movies: [],
          shows: [],
        },
        provider: {
          tmdbId: 0,
        },
        source: '',
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  /**
   * Converts a PersonEntity to a response object.
   * @param entity - The entity to convert.
   * @returns The converted response.
   */
  toResponse(entity: PersonEntity): PersonResponseProps {
    const copy = entity.getProps();
    return {
      id: copy.provider.tmdbId,
      name: copy.name,
      imdb_id: '',
      gender: parseInt(copy.gender.toString(), 10),
      homepage: null,
      adult: false,
      also_known_as: null,
      birthday: null,
      deathday: null,
      place_of_birth: null,
      popularity: copy.popularity.tmdb,
      profile_path: copy.artwork.poster ? copy.artwork.poster.url : '',
      images: {
        profiles: [
          {
            aspect_ratio: 0,
            height: 0,
            iso_639_1: null,
            vote_average: 0,
            vote_count: 0,
            width: 0,
            file_path: copy.artwork.poster?.url || '',
          },
        ],
      },
      biography: copy.bio,
      known_for_department: copy.role,
    };
  }
}
