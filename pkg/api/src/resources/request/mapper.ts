import { Mapper } from "@/infra/entity/mapper";
import { Service } from "diod";
import { RequestType } from "@/resources/request/types";
import { RequestSchemaProps } from "./schema";
import { RequestEntity } from "./entity";

/**
 * Mapper class for converting between RequestEntity and RequestSchemaProps.
 */
@Service()
export class RequestMapper implements Mapper<RequestEntity, RequestSchemaProps, any> {
  /**
   * Converts a RequestEntity to a RequestSchemaProps.
   * @param entity - The entity to convert.
   * @returns The converted entity.
   */
  toPeristence(entity: RequestEntity): RequestSchemaProps {
    const copy = entity.getProps();
    return {
      requestId: copy.id,
      type: copy.type,
      title: copy.title,
      thumb: copy.thumbnail,
      imdb_id: copy.imdbId,
      tmdb_id: copy.tmdbId,
      tvdb_id: copy.tvdbId,
      users: copy.users,
      sonarrId: copy.sonarrs,
      radarrId: copy.radarrs,
      approved: copy.approved,
      manualStatus: copy.status,
      pendingDefault: copy.pending,
      seasons: copy.seasons,
      timeStamp: copy.createdAt,
    };
  }

  /**
   * Converts a RequestSchemaProps to a RequestEntity.
   * @param record - The record to convert.
   * @returns The converted record.
   */
  toEntity(record: RequestSchemaProps): RequestEntity {
    return new RequestEntity({
      id: record.requestId,
      props: {
        title: record.title,
        type: record.type === 'movie' ? RequestType.MOVIE : RequestType.TV,
        thumbnail: record.thumb,
        status: record.manualStatus,
        imdbId: record.imdb_id,
        tmdbId: record.tmdb_id,
        tvdbId: record.tvdb_id,
        seasons: record.seasons,
        approved: record.approved,
        pending: record.pendingDefault,
        radarrs: record.radarrId,
        sonarrs: record.sonarrId,
        users: record.users,
        timestamp: record.timeStamp,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Converts a RequestEntity to a response object.
   * @param entity - The entity to convert.
   * @returns The converted response.
   */
  toResponse(entity: RequestEntity): any {
    const copy = entity.getProps();
    return {
      id: copy.id,
      title: copy.title,
      type: copy.type,
      thumbnail: copy.thumbnail,
      status: copy.status,
      imdbId: copy.imdbId,
      tmdbId: copy.tmdbId,
      tvdbId: copy.tvdbId,
      seasons: copy.seasons,
      approved: copy.approved,
      pendingDefault: copy.pending,
      radarrs: copy.radarrs,
      sonarrs: copy.sonarrs,
      users: copy.users,
      timestamp: copy.timestamp,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }
}
