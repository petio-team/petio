/* eslint-disable no-underscore-dangle */
import { Mapper } from "@/infra/entity/mapper";
import { Service } from "diod";
import { ReviewType } from "@/resources/review/types";
import { ReviewSchemaProps } from "./schema";
import { ReviewEntity } from "./entity";

/**
 * Mapper class for converting between ReviewEntity and ReviewSchemaProps.
 */
@Service()
export class ReviewMapper implements Mapper<ReviewEntity, ReviewSchemaProps, any> {
  /**
   * Converts a ReviewEntity to a ReviewSchemaProps.
   * @param entity - The entity to convert.
   * @returns The converted entity.
   */
  toPeristence(entity: ReviewEntity): ReviewSchemaProps {
    const copy = entity.getProps();
    return {
      _id: copy.id,
      score: copy.score,
      comment: copy.comment,
      user: copy.user,
      tmdb_id: copy.tmdbId,
      date: copy.date,
      type: copy.type,
      title: copy.title,
    };
  }

  /**
   * Converts a ReviewSchemaProps to a ReviewEntity.
   * @param record - The record to convert.
   * @returns The converted record.
   */
  toEntity(record: ReviewSchemaProps): ReviewEntity {
    return new ReviewEntity({
      id: record._id.toString(),
      props: {
        score: record.score,
        comment: record.comment,
        user: record.user,
        tmdbId: record.tmdb_id,
        date: record.date,
        type: record.type === 'movie' ? ReviewType.MOVIE : ReviewType.TV,
        title: record.title,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Converts a ReviewEntity to a response object.
   * @param entity - The entity to convert.
   * @returns The converted response.
   */
  toResponse(entity: ReviewEntity): any {
    const copy = entity.getProps();
    return {
      id: copy.id,
      score: copy.score,
      comment: copy.comment,
      user: copy.user,
      tmdbId: copy.tmdbId,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }
}
