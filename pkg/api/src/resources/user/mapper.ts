/* eslint-disable no-underscore-dangle */
import { Mapper } from "@/infra/entity/mapper";
import { Service } from "diod";
import { UserRole } from "@/resources/user/types";
import { UserSchemaProps } from "./schema";
import { UserEntity } from "./entity";

/**
 * Mapper class for converting between UserEntity and UserSchemaProps.
 */
@Service()
export class UserMapper implements Mapper<UserEntity, UserSchemaProps, any> {
  /**
   * Converts a UserEntity to a UserSchemaProps.
   * @param entity - The entity to convert.
   * @returns The converted entity.
   */
  toPeristence(entity: UserEntity): UserSchemaProps {
    const copy = entity.getProps();
    return {
      _id: copy.id,
      title: copy.title,
      username: copy.username,
      password: copy.password,
      email: copy.email,
      thumbnail: copy.thumbnail,
      custom_thumb: copy.custom,
      altId: copy.altId,
      plexId: copy.plexId,
      lastIp: copy.lastIp,
      role: copy.role,
      owner: copy.owner,
      custom: copy.custom,
      disabled: copy.disabled,
      quotaCount: copy.quotaCount,
      lastLogin: copy.lastLogin,
      profileId: copy.profileId,
    };
  }

  /**
   * Converts a UserSchemaProps to a UserEntity.
   * @param record - The record to convert.
   * @returns The converted record.
   */
  toEntity(record: UserSchemaProps): UserEntity {
    return new UserEntity({
      id: record._id,
      props: {
        title: record.title,
        username: record.username,
        password: record.password,
        email: record.email,
        thumbnail: record.thumbnail,
        customThumbnail: record.custom_thumb,
        altId: record.altId,
        plexId: record.plexId,
        lastIp: record.lastIp,
        role: record.role === 'admin' ? UserRole.ADMIN : UserRole.USER,
        owner: record.owner,
        custom: record.custom,
        disabled: record.disabled,
        quotaCount: record.quotaCount,
        lastLogin: record.lastLogin,
        profileId: record.profileId,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Converts a UserEntity to a response object.
   * @param entity - The entity to convert.
   * @returns The converted response.
   */
  toResponse(entity: UserEntity): any {
    const copy = entity.getProps();
    return {
      id: copy.id,
      title: copy.title,
      username: copy.username,
      // Do not show password for obvious reasons (hashed or not)
      email: copy.email,
      thumbnail: copy.thumbnail,
      customThumbnail: copy.customThumbnail,
      altId: copy.altId,
      plexId: copy.plexId,
      lastIp: copy.lastIp,
      role: copy.role,
      owner: copy.owner,
      custom: copy.custom,
      disabled: copy.disabled,
      quotaCount: copy.quotaCount,
      lastLogin: copy.lastLogin,
      profileId: copy.profileId,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }
}
