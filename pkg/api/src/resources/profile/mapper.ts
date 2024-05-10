/* eslint-disable no-underscore-dangle */
import { Mapper } from "@/infrastructure/entity/mapper";
import { Service } from "diod";
import { ProfileSchemaProps } from "./schema";
import { ProfileEntity } from "./entity";

/**
 * Mapper class for converting between ProfileEntity and ProfileSchemaProps.
 */
@Service()
export class ProfileMapper implements Mapper<ProfileEntity, ProfileSchemaProps, any> {
  /**
   * Converts a ProfileEntity to a ProfileSchemaProps.
   * @param entity - The entity to convert.
   * @returns The converted entity.
   */
  toPeristence(entity: ProfileEntity): ProfileSchemaProps {
    const copy = entity.getProps();
    return {
      _id: copy.id,
      name: copy.name,
      radarr: copy.radarr,
      sonarr: copy.sonarr,
      autoApprove: copy.autoApprove,
      autoApproveTv: copy.autoApproveTv,
      quota: copy.quota,
      isDefault: copy.isDefault,
    };
  }

  /**
   * Converts a ProfileSchemaProps to a ProfileEntity.
   * @param record - The record to convert.
   * @returns The converted record.
   */
  toEntity(record: ProfileSchemaProps): ProfileEntity {
    return new ProfileEntity({
      id: record._id,
      props: {
        name: record.name,
        radarr: record.radarr,
        sonarr: record.sonarr,
        autoApprove: record.autoApprove,
        autoApproveTv: record.autoApproveTv,
        quota: record.quota,
        isDefault: record.isDefault,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Converts a ProfileEntity to a response object.
   * @param entity - The entity to convert.
   * @returns The converted response.
   */
  toResponse(entity: ProfileEntity): any {
    const copy = entity.getProps();
    return {
      id: copy.id,
      name: copy.name,
      radarr: copy.radarr,
      sonarr: copy.sonarr,
      autoApprove: copy.autoApprove,
      autoApproveTv: copy.autoApproveTv,
      quota: copy.quota,
      isDefault: copy.isDefault,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }
}
