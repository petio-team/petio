import { Service } from 'diod';

import { Mapper } from '@/infrastructure/entity/mapper';
import { CompanyResponseProps } from '@/resources/company/response';

import { CompanyEntity } from './entity';

/**
 * Mapper class for converting between CompanyEntity and CompanySchemaProps.
 */
@Service()
export class CompanyMapper
  implements Mapper<CompanyEntity, any, CompanyResponseProps>
{
  /**
   * Converts a CompanyEntity to a CompanySchemaProps.
   * @param entity - The entity to convert.
   * @returns The converted entity.
   */
  toPeristence(entity: CompanyEntity): any {
    const copy = entity.getProps();
    return {
      id: copy.id,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }

  /**
   * Converts a CompanySchemaProps to a CompanyEntity.
   * @param record - The record to convert.
   * @returns The converted record.
   */
  toEntity(record: any): CompanyEntity {
    return new CompanyEntity({
      id: record.id,
      props: {
        name: record.name,
        artwork: record.artwork,
        provider: record.provider,
        source: record.source,
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  /**
   * Converts a CompanyEntity to a response object.
   * @param entity - The entity to convert.
   * @returns The converted response.
   */
  toResponse(entity: CompanyEntity): CompanyResponseProps {
    const copy = entity.getProps();
    return {
      id: copy.provider.tmdbId,
      name: copy.name,
      logo_path: copy.artwork.logo?.url || '',
    };
  }
}
