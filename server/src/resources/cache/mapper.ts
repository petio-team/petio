/* eslint-disable no-underscore-dangle */
import { Mapper } from "@/infrastructure/entity/mapper";
import { Service } from "diod";
import { CacheSchemaProps } from "./schema";
import { CacheEntity } from "./entity";

/**
 * Mapper class for converting between CacheEntity and CacheSchemaProps.
 */
@Service()
export class CacheMapper implements Mapper<CacheEntity, CacheSchemaProps, any> {
  /**
   * Converts a CacheEntity to a CacheSchemaProps.
   * @param entity - The entity to convert.
   * @returns The converted entity.
   */
  toPeristence(entity: CacheEntity): CacheSchemaProps {
    const copy = entity.getProps();
    return {
      id: copy.id,
      key: copy.key,
      value: copy.value,
      expires: copy.expires,
    };
  }

  /**
   * Converts a CacheSchemaProps to a CacheEntity.
   * @param record - The record to convert.
   * @returns The converted record.
   */
  toEntity(record: CacheSchemaProps): CacheEntity {
    return new CacheEntity({
      id: record.id,
      props: {
        key: record.key,
        value: record.value,
        expires: record.expires,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Converts a CacheEntity to a response object.
   * @param entity - The entity to convert.
   * @returns The converted response.
   */
  toResponse(entity: CacheEntity): any {
    const copy = entity.getProps();
    return {
      id: copy.id,
      key: copy.key,
      value: copy.value,
      expires: copy.expires,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }
}
