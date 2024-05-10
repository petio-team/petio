import { Mapper } from "@/infra/entity/mapper";
import { Service } from "diod";
import { MediaServerSchemaProps } from "./schema";
import { MediaServerEntity } from "./entity";

/**
 * Mapper class for converting between MediaServerEntity and MediaServerSchemaProps.
 */
@Service()
export class MediaServerMapper implements Mapper<MediaServerEntity, MediaServerSchemaProps, any> {
  /**
   * Converts a MediaServerEntity to a MediaServerSchemaProps.
   * @param entity - The entity to convert.
   * @returns The converted entity.
   */
  toPeristence(entity: MediaServerEntity): MediaServerSchemaProps {
    const copy = entity.getProps();
    return {
      id: copy.id,
      name: copy.name,
      type: copy.type,
      url: copy.url,
      token: copy.token,
      enabled: copy.enabled,
      metadata: copy.metadata,
      libraries: copy.libraries,
      users: copy.users,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }

  /**
   * Converts a MediaServerSchemaProps to a MediaServerEntity.
   * @param record - The record to convert.
   * @returns The converted record.
   */
  toEntity(record: MediaServerSchemaProps): MediaServerEntity {
    return new MediaServerEntity({
      id: record.id,
      props: {
        name: record.name,
        type: record.type,
        url: record.url,
        token: record.token,
        enabled: record.enabled,
        metadata: record.metadata,
        libraries: record.libraries || [],
        users: record.users || [],
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  /**
   * Converts a MediaServerEntity to a response object.
   * @param entity - The entity to convert.
   * @returns The converted response.
   */
  toResponse(entity: MediaServerEntity): any {
    const copy = entity.getProps();
    return {
      id: copy.id,
      name: copy.name,
      url: copy.url,
      // do not include token in response
      enabled: copy.enabled,
      metadata: copy.metadata,
      libraries: copy.libraries,
      users: copy.users,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }
}
