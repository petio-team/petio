import { Mapper } from "@/infra/entity/mapper";
import { Service } from "diod";
import { DownloaderSchemaProps } from "./schema";
import { DownloaderEntity } from "./entity";

/**
 * Mapper class for converting between DownloaderEntity and DownloaderSchemaProps.
 */
@Service()
export class DownloaderMapper implements Mapper<DownloaderEntity, DownloaderSchemaProps, any> {
  /**
   * Converts a DownloaderEntity to a DownloaderSchemaProps.
   * @param entity - The entity to convert.
   * @returns The converted entity.
   */
  toPeristence(entity: DownloaderEntity): DownloaderSchemaProps {
    const copy = entity.getProps();
    return {
      id: copy.id,
      name: copy.name,
      type: copy.type,
      url: copy.url,
      token: copy.token,
      metadata: copy.metadata,
      enabled: copy.enabled,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }

  /**
   * Converts a DownloaderSchemaProps to a DownloaderEntity.
   * @param record - The record to convert.
   * @returns The converted record.
   */
  toEntity(record: DownloaderSchemaProps): DownloaderEntity {
    return new DownloaderEntity({
      id: record.id,
      props: {
        name: record.name,
        type: record.type,
        url: record.url,
        token: record.token,
        metadata: record.metadata,
        enabled: record.enabled,
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  /**
   * Converts a DownloaderEntity to a response object.
   * @param entity - The entity to convert.
   * @returns The converted response.
   */
  toResponse(entity: DownloaderEntity): any {
    const copy = entity.getProps();
    return {
      id: copy.id,
      name: copy.name,
      type: copy.type,
      url: copy.url,
      // token: copy.token, // Do not include sensitive data in responses
      metadata: copy.metadata,
      enabled: copy.enabled,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }
}
