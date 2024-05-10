import { Mapper } from "@/infrastructure/entity/mapper";
import { Service } from "diod";
import { DiscoverySchemaProps } from "./schema";
import { DiscoveryEntity } from "./entity";

/**
 * Mapper class for converting between DiscoveryEntity and DiscoverySchemaProps.
 */
@Service()
export class DiscoveryMapper implements Mapper<DiscoveryEntity, DiscoverySchemaProps, any> {
  /**
   * Converts a DiscoveryEntity to a DiscoverySchemaProps.
   * @param entity - The entity to convert.
   * @returns The converted entity.
   */
  toPeristence(entity: DiscoveryEntity): DiscoverySchemaProps {
    const copy = entity.getProps();
    return {
      id: copy.id,
      movie: copy.movie,
      series: copy.series,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }

  /**
   * Converts a DiscoverySchemaProps to a DiscoveryEntity.
   * @param record - The record to convert.
   * @returns The converted record.
   */
  toEntity(record: DiscoverySchemaProps): DiscoveryEntity {
    return new DiscoveryEntity({
      id: record.id,
      props: {
        movie: record.movie,
        series: record.series,
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  /**
   * Converts a DiscoveryEntity to a response object.
   * @param entity - The entity to convert.
   * @returns The converted response.
   */
  toResponse(entity: DiscoveryEntity): any {
    const copy = entity.getProps();
    return {
      id: copy.id,
      movie: copy.movie,
      series: copy.series,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }
}
