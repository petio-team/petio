import { Mapper } from "@/infra/entity/mapper";
import { Service } from "diod";
import { IssueSchemaProps } from "./schema";
import { IssueEntity } from "./entity";

/**
 * Mapper class for converting between IssueEntity and IssueSchemaProps.
 */
@Service()
export class IssueMapper implements Mapper<IssueEntity, IssueSchemaProps, any> {
  /**
   * Converts a IssueEntity to a IssueSchemaProps.
   * @param entity - The entity to convert.
   * @returns The converted entity.
   */
  toPeristence(entity: IssueEntity): IssueSchemaProps {
    const copy = entity.getProps();
    return {
      mediaId: copy.id,
      type: copy.type,
      title: copy.title,
      issue: copy.issue,
      comment: copy.comment,
      tmdbId: copy.tmdbId,
      user: copy.user,
      sonarrId: copy.sonarrs,
      radarrId: copy.radarrs,
    };
  }

  /**
   * Converts a IssueSchemaProps to a IssueEntity.
   * @param record - The record to convert.
   * @returns The converted record.
   */
  toEntity(record: IssueSchemaProps): IssueEntity {
    return new IssueEntity({
      id: record.mediaId,
      props: {
        type: record.type,
        title: record.title,
        issue: record.issue,
        comment: record.comment,
        tmdbId: record.tmdbId,
        user: record.user,
        sonarrs: record.sonarrId,
        radarrs: record.radarrId,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Converts a IssueEntity to a response object.
   * @param entity - The entity to convert.
   * @returns The converted response.
   */
  toResponse(entity: IssueEntity): any {
    const copy = entity.getProps();
    return {
      id: copy.id,
      type: copy.type,
      title: copy.title,
      issue: copy.issue,
      comment: copy.comment,
      tmdbId: copy.tmdbId,
      user: copy.user,
      sonarrs: copy.sonarrs,
      radarrs: copy.radarrs,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }
}
