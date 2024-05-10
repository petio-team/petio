import { Mapper } from "@/infra/entity/mapper";
import { Service } from "diod";
import { SettingsSchemaProps } from "./schema";
import { SettingsEntity } from "./entity";

/**
 * Mapper class for converting between SettingsEntity and SettingsSchemaProps.
 */
@Service()
export class SettingsMapper implements Mapper<SettingsEntity, SettingsSchemaProps, any> {
  /**
   * Converts a SettingsEntity to a SettingsSchemaProps.
   * @param entity - The entity to convert.
   * @returns The converted entity.
   */
  toPeristence(entity: SettingsEntity): SettingsSchemaProps {
    const copy = entity.getProps();
    return {
      id: copy.id,
      popularContent: copy.popularContent,
      authType: copy.authType,
      appKeys: copy.appKeys,
      initialCache: copy.initialCache,
      initialSetup: copy.initialSetup,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }

  /**
   * Converts a SettingsSchemaProps to a SettingsEntity.
   * @param record - The record to convert.
   * @returns The converted record.
   */
  toEntity(record: SettingsSchemaProps): SettingsEntity {
    return new SettingsEntity({
      id: record.id,
      props: {
        popularContent: record.popularContent,
        authType: record.authType,
        appKeys: record.appKeys,
        initialCache: record.initialCache,
        initialSetup: record.initialSetup,
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  /**
   * Converts a SettingsEntity to a response object.
   * @param entity - The entity to convert.
   * @returns The converted response.
   */
  toResponse(entity: SettingsEntity): any {
    const copy = entity.getProps();
    return {
      id: copy.id,
      popularContent: copy.popularContent,
      authType: copy.authType,
      appKeys: copy.appKeys,
      initialCache: copy.initialCache,
      initialSetup: copy.initialSetup,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }
}
