/* eslint-disable no-underscore-dangle */
import { Mapper } from "@/infra/entity/mapper";
import { Service } from "diod";
import { ImdbSchemaProps } from "./schema";
import { ImdbEntity } from "./entity";

/**
 * Mapper class for converting between ImdbEntity and ImdbSchemaProps.
 */
@Service()
export class ImdbMapper implements Mapper<ImdbEntity, ImdbSchemaProps, any> {
  /**
   * Converts a ImdbEntity to a ImdbSchemaProps.
   * @param entity - The entity to convert.
   * @returns The converted entity.
   */
  toPeristence(entity: ImdbEntity): ImdbSchemaProps {
    const copy = entity.getProps();
    return {
      _id: copy.id,
      rating: copy.rating,
    };
  }

  /**
   * Converts a ImdbSchemaProps to a ImdbEntity.
   * @param record - The record to convert.
   * @returns The converted record.
   */
  toEntity(record: ImdbSchemaProps): ImdbEntity {
    return new ImdbEntity({
      id: record._id,
      props: {
        rating: record.rating,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Converts a ImdbEntity to a response object.
   * @param entity - The entity to convert.
   * @returns The converted response.
   */
  toResponse(entity: ImdbEntity): any {
    const copy = entity.getProps();
    return {
      id: copy.id,
      rating: copy.rating,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }
}
