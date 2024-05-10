import { Mapper } from "@/infrastructure/entity/mapper";
import { Service } from "diod";
import { NotificationSchemaProps } from "./schema";
import { NotificationEntity } from "./entity";

/**
 * Mapper class for converting between NotificationEntity and NotificationSchemaProps.
 */
@Service()
export class NotificationMapper implements Mapper<NotificationEntity, NotificationSchemaProps, any> {
  /**
   * Converts a NotificationEntity to a NotificationSchemaProps.
   * @param entity - The entity to convert.
   * @returns The converted entity.
   */
  toPeristence(entity: NotificationEntity): NotificationSchemaProps {
    const copy = entity.getProps();
    return {
      id: copy.id,
      name: copy.name,
      url: copy.url,
      type: copy.type,
      metadata: copy.metadata,
      enabled: copy.enabled,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }

  /**
   * Converts a NotificationSchemaProps to a NotificationEntity.
   * @param record - The record to convert.
   * @returns The converted record.
   */
  toEntity(record: NotificationSchemaProps): NotificationEntity {
    return new NotificationEntity({
      id: record.id,
      props: {
        name: record.name,
        url: record.url,
        type: record.type,
        metadata: record.metadata,
        enabled: record.enabled,
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  /**
   * Converts a NotificationEntity to a response object.
   * @param entity - The entity to convert.
   * @returns The converted response.
   */
  toResponse(entity: NotificationEntity): any {
    const copy = entity.getProps();
    return {
      id: copy.id,
      name: copy.name,
      url: copy.url,
      type: copy.type,
      metadata: copy.metadata,
      enabled: copy.enabled,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }
}
