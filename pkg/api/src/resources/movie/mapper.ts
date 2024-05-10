/* eslint-disable no-underscore-dangle */
import { Mapper } from "@/infra/entity/mapper";
import { Service } from "diod";
import { MovieSchemaProps } from "./schema";
import { MovieEntity } from "./entity";

/**
 * Mapper class for converting between MovieEntity and MovieSchemaProps.
 */
@Service()
export class MovieMapper implements Mapper<MovieEntity, MovieSchemaProps, any> {
  /**
   * Converts a MovieEntity to a MovieSchemaProps.
   * @param entity - The entity to convert.
   * @returns The converted entity.
   */
  toPeristence(entity: MovieEntity): MovieSchemaProps {
    const copy = entity.getProps();
    return {
      _id: copy.id,
      title: copy.title,
      ratingKey: copy.ratingKey,
      key: copy.key,
      guid: copy.guid,
      studio: copy.studio,
      type: copy.type,
      titleSort: copy.titleSort,
      contentRating: copy.contentRating,
      summary: copy.summary,
      index: copy.index,
      rating: copy.rating,
      year: copy.year,
      tagline: copy.tagline,
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
      primaryExtraKey: copy.primaryExtraKey,
      ratingImage: copy.ratingImage,
      Media: copy.Media,
      Genre: copy.Genre,
      Director: copy.Director,
      Writer: copy.Writer,
      Country: copy.Country,
      Role: copy.Role,
      idSource: copy.idSource,
      externalId: copy.externalId,
      imdb_id: copy.imdb_id,
      tmdb_id: copy.tmdb_id,
      petioTimestamp: copy.petioTimestamp,
    };
  }

  /**
   * Converts a MovieSchemaProps to a MovieEntity.
   * @param record - The record to convert.
   * @returns The converted record.
   */
  toEntity(record: MovieSchemaProps): MovieEntity {
    return new MovieEntity({
      id: record._id,
      props: {
        title: record.title,
        ratingKey: record.ratingKey,
        key: record.key,
        guid: record.guid,
        studio: record.studio,
        type: record.type,
        titleSort: record.titleSort,
        contentRating: record.contentRating,
        summary: record.summary,
        index: record.index,
        rating: record.rating,
        year: record.year,
        tagline: record.tagline,
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
        primaryExtraKey: record.primaryExtraKey,
        ratingImage: record.ratingImage,
        Media: record.Media,
        Genre: record.Genre,
        Director: record.Director,
        Writer: record.Writer,
        Country: record.Country,
        Role: record.Role,
        idSource: record.idSource,
        externalId: record.externalId,
        imdb_id: record.imdb_id,
        tmdb_id: record.tmdb_id,
        petioTimestamp: record.petioTimestamp,
      },
      createdAt: new Date(),
      updatedAt: new Date(record.updatedAt),
    });
  }

  /**
   * Converts a MovieEntity to a response object.
   * @param entity - The entity to convert.
   * @returns The converted response.
   */
  toResponse(entity: MovieEntity): any {
    const copy = entity.getProps();
    return {
      id: copy.id,
      title: copy.title,
      ratingKey: copy.ratingKey,
      key: copy.key,
      guid: copy.guid,
      studio: copy.studio,
      type: copy.type,
      titleSort: copy.titleSort,
      contentRating: copy.contentRating,
      summary: copy.summary,
      index: copy.index,
      rating: copy.rating,
      year: copy.year,
      tagline: copy.tagline,
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
      primaryExtraKey: copy.primaryExtraKey,
      ratingImage: copy.ratingImage,
      Media: copy.Media,
      Genre: copy.Genre,
      Director: copy.Director,
      Writer: copy.Writer,
      Country: copy.Country,
      Role: copy.Role,
      idSource: copy.idSource,
      externalId: copy.externalId,
      imdb_id: copy.imdb_id,
      tmdb_id: copy.tmdb_id,
      petioTimestamp: copy.petioTimestamp,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }
}
