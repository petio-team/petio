import { Service } from 'diod';

import { Mapper } from '@/infrastructure/entity/mapper';
import { NetworkResponseProps } from '@/resources/network/response';

import { NetworkEntity } from './entity';

/**
 * Mapper class for converting between NetworkEntity and NetworkSchemaProps.
 */
@Service()
export class NetworkMapper
  implements Mapper<NetworkEntity, any, NetworkResponseProps>
{
  /**
   * Converts a NetworkEntity to a NetworkSchemaProps.
   * @param entity - The entity to convert.
   * @returns The converted entity.
   */
  toPeristence(entity: NetworkEntity): any {
    const copy = entity.getProps();
    return {
      id: copy.id,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }

  /**
   * Converts a NetworkSchemaProps to a NetworkEntity.
   * @param record - The record to convert.
   * @returns The converted record.
   */
  toEntity(record: any): NetworkEntity {
    return new NetworkEntity({
      id: record.id,
      props: {
        name: record.name,
        artwork: {
          logo: {
            url: record.logo_path,
            source: 'tmdb',
          },
        },
        providers: {
          tmdbId: record.id,
        },
        source: 'tmdb',
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  /**
   * Converts a NetworkEntity to a response object.
   * @param entity - The entity to convert.
   * @returns The converted response.
   */
  toResponse(entity: NetworkEntity): NetworkResponseProps {
    const copy = entity.getProps();
    return {
      id: copy.providers.tmdbId,
      name: copy.name,
      logo_path: copy.artwork.logo?.url || '',
    };
  }
}
