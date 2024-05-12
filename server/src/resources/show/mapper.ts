/* eslint-disable no-underscore-dangle */
import { Mapper } from "@/infrastructure/entity/mapper";
import { Service } from "diod";
import { ShowSchemaProps } from "./schema";
import { ShowEntity } from "./entity";

/**
 * Mapper class for converting between ShowEntity and ShowSchemaProps.
 */
@Service()
export class ShowMapper implements Mapper<ShowEntity, ShowSchemaProps, any> {
  /**
   * Converts a ShowEntity to a ShowSchemaProps.
   * @param entity - The entity to convert.
   * @returns The converted entity.
   */
  toPeristence(entity: ShowEntity): ShowSchemaProps {
    const copy = entity.getProps();
    return {
      _id: copy.id,
      ratingKey: copy.ratingKey,
      key: copy.key,
      guid: copy.guid,
      studio: copy.studio,
      type: copy.type,
      title: copy.title,
      titleSort: copy.titleSort,
      contentRating: copy.contentRating,
      summary: copy.summary,
      index: copy.index,
      rating: copy.rating,
      year: copy.year,
      thumb: copy.thumb,
      art: copy.art,
      banner: copy.banner,
      theme: copy.theme,
      duration: copy.duration,
      originallyAvailableAt: copy.originallyAvailableAt,
      leafCount: copy.leafCount,
      viewedLeafCount: copy.viewedLeafCount,
      childCount: copy.childCount,
      addedAt: copy.addedAt,
      updatedAt: copy.updatedAt.getTime(),
      Genre: copy.Genre,
      idSource: copy.idSource,
      externalId: copy.externalId,
      tvdb_id: copy.tvdb_id,
      imdb_id: copy.imdb_id,
      tmdb_id: copy.tmdb_id,
      petioTimestamp: copy.petioTimestamp,
      seasonData: copy.seasonData,
    };
  }

  /**
   * Converts a ShowSchemaProps to a ShowEntity.
   * @param record - The record to convert.
   * @returns The converted record.
   */
  toEntity(record: ShowSchemaProps): ShowEntity {
    return new ShowEntity({
      id: record._id,
      props: {
        ratingKey: record.ratingKey,
        key: record.key,
        guid: record.guid,
        studio: record.studio,
        type: record.type,
        title: record.title,
        titleSort: record.titleSort,
        contentRating: record.contentRating,
        summary: record.summary,
        index: record.index,
        rating: record.rating,
        year: record.year,
        thumb: record.thumb,
        art: record.art,
        banner: record.banner,
        theme: record.theme,
        duration: record.duration,
        originallyAvailableAt: record.originallyAvailableAt,
        leafCount: record.leafCount,
        viewedLeafCount: record.viewedLeafCount,
        childCount: record.childCount,
        addedAt: record.addedAt,
        Genre: record.Genre,
        idSource: record.idSource,
        externalId: record.externalId,
        tvdb_id: record.tvdb_id,
        imdb_id: record.imdb_id,
        tmdb_id: record.tmdb_id,
        petioTimestamp: record.petioTimestamp,
        seasonData: record.seasonData,
      },
      createdAt: new Date(),
      updatedAt: new Date(record.updatedAt),
    });
  }

  /**
   * Converts a ShowEntity to a response object.
   * @param entity - The entity to convert.
   * @returns The converted response.
   */
  toResponse(entity: ShowEntity): any {
    const copy = entity.getProps();
    return {
      id: copy.id,
      ratingKey: copy.ratingKey,
      key: copy.key,
      guid: copy.guid,
      studio: copy.studio,
      type: copy.type,
      title: copy.title,
      titleSort: copy.titleSort,
      contentRating: copy.contentRating,
      summary: copy.summary,
      index: copy.index,
      rating: copy.rating,
      year: copy.year,
      thumb: copy.thumb,
      art: copy.art,
      banner: copy.banner,
      theme: copy.theme,
      duration: copy.duration,
      originallyAvailableAt: copy.originallyAvailableAt,
      leafCount: copy.leafCount,
      viewedLeafCount: copy.viewedLeafCount,
      childCount: copy.childCount,
      addedAt: copy.addedAt,
      Genre: copy.Genre,
      idSource: copy.idSource,
      externalId: copy.externalId,
      tvdb_id: copy.tvdb_id,
      imdb_id: copy.imdb_id,
      tmdb_id: copy.tmdb_id,
      petioTimestamp: copy.petioTimestamp,
      seasonData: copy.seasonData,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }
}
