import { Mapper } from "@/infrastructure/entity/mapper";
import { Service } from "diod";
import { ArchiveSchemaProps } from "./schema";
import { ArchiveEntity } from "./entity";

/**
 * Mapper class for converting between ArchiveEntity and ArchiveSchemaProps.
 */
@Service()
export class ArchiveMapper implements Mapper<ArchiveEntity, ArchiveSchemaProps, any> {
  /**
   * Converts a ArchiveEntity to a ArchiveSchemaProps.
   * @param entity - The entity to convert.
   * @returns The converted entity.
   */
  toPeristence(entity: ArchiveEntity): ArchiveSchemaProps {
    const copy = entity.getProps();
    return {
      requestId: copy.id,
      type: copy.type,
      title: copy.title,
      thumb: copy.thumb,
      imdb_id: copy.imdb_id,
      tmdb_id: copy.tmdb_id,
      tvdb_id: copy.tvdb_id,
      users: copy.users,
      sonarrId: copy.sonarrId,
      radarrId: copy.radarrId,
      approved: copy.approved,
      removed: copy.removed,
      removed_reason: copy.removed_reason,
      complete: copy.complete,
      timeStamp: copy.timeStamp,
    };
  }

  /**
   * Converts a ArchiveSchemaProps to a ArchiveEntity.
   * @param record - The record to convert.
   * @returns The converted record.
   */
  toEntity(record: ArchiveSchemaProps): ArchiveEntity {
    return new ArchiveEntity({
      id: record.requestId,
      props: {
        type: record.type,
        title: record.title,
        thumb: record.thumb,
        imdb_id: record.imdb_id,
        tmdb_id: record.tmdb_id,
        tvdb_id: record.tvdb_id,
        users: record.users,
        sonarrId: record.sonarrId,
        radarrId: record.radarrId,
        approved: record.approved,
        removed: record.removed,
        removed_reason: record.removed_reason,
        complete: record.complete,
        timeStamp: record.timeStamp,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Converts a ArchiveEntity to a response object.
   * @param entity - The entity to convert.
   * @returns The converted response.
   */
  toResponse(entity: ArchiveEntity): any {
    const copy = entity.getProps();
    return {
      id: copy.id,
      type: copy.type,
      title: copy.title,
      thumb: copy.thumb,
      imdb_id: copy.imdb_id,
      tmdb_id: copy.tmdb_id,
      tvdb_id: copy.tvdb_id,
      users: copy.users,
      sonarrId: copy.sonarrId,
      radarrId: copy.radarrId,
      approved: copy.approved,
      removed: copy.removed,
      removed_reason: copy.removed_reason,
      complete: copy.complete,
      timeStamp: copy.timeStamp,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }
}
