/* eslint-disable no-underscore-dangle */
import { Mapper } from "@/infrastructure/entity/mapper";
import { Service } from "diod";
import { MediaLibraryType } from "@/resources/media-library/types";
import { MediaLibrarySchemaProps } from "./schema";
import { MediaLibraryEntity } from "./entity";

/**
 * Mapper class for converting between MediaLibraryEntity and MediaLibrarySchemaProps.
 */
@Service()
export class MediaLibraryMapper implements Mapper<MediaLibraryEntity, MediaLibrarySchemaProps, any> {
  /**
   * Converts a MediaLibraryEntity to a MediaLibrarySchemaProps.
   * @param entity - The entity to convert.
   * @returns The converted entity.
   */
  toPeristence(entity: MediaLibraryEntity): MediaLibrarySchemaProps {
    const copy = entity.getProps();
    return {
      _id: copy.id,
      allowSync: copy.allowSync,
      art: copy.art,
      composite: copy.composite,
      filters: copy.filters,
      refreshing: copy.refreshing,
      thumb: copy.thumb,
      key: copy.key,
      type: copy.type,
      title: copy.title,
      agent: copy.agent,
      scanner: copy.scanner,
      language: copy.language,
      uuid: copy.uuid,
      scannedAt: copy.scannedAt,
      content: copy.content,
      directory: copy.directory,
      contentChangedAt: copy.contentChangedAt,
      hidden: copy.hidden,
      createdAt: copy.createdAt.getTime(),
      updatedAt: copy.updatedAt.getTime(),
    };
  }

  /**
   * Converts a MediaLibrarySchemaProps to a MediaLibraryEntity.
   * @param record - The record to convert.
   * @returns The converted record.
   */
  toEntity(record: MediaLibrarySchemaProps): MediaLibraryEntity {
    return new MediaLibraryEntity({
      id: record._id,
      props: {
        allowSync: record.allowSync,
        art: record.art,
        composite: record.composite,
        filters: record.filters,
        refreshing: record.refreshing,
        thumb: record.thumb,
        key: record.key,
        type: record.type === 'movie' ? MediaLibraryType.MOVIE : MediaLibraryType.SHOW,
        title: record.title,
        agent: record.agent,
        scanner: record.scanner,
        language: record.language,
        uuid: record.uuid,
        scannedAt: record.scannedAt,
        content: record.content,
        directory: record.directory,
        contentChangedAt: record.contentChangedAt,
        hidden: record.hidden,
      },
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
    });
  }

  /**
   * Converts a MediaLibraryEntity to a response object.
   * @param entity - The entity to convert.
   * @returns The converted response.
   */
  toResponse(entity: MediaLibraryEntity): any {
    const copy = entity.getProps();
    return {
      id: copy.id,
      allowSync: copy.allowSync,
      art: copy.art,
      composite: copy.composite,
      filters: copy.filters,
      refreshing: copy.refreshing,
      thumb: copy.thumb,
      key: copy.key,
      type: copy.type,
      title: copy.title,
      agent: copy.agent,
      scanner: copy.scanner,
      language: copy.language,
      uuid: copy.uuid,
      scannedAt: copy.scannedAt,
      content: copy.content,
      directory: copy.directory,
      contentChangedAt: copy.contentChangedAt,
      hidden: copy.hidden,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }
}
