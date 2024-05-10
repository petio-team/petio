/* eslint-disable no-underscore-dangle */
import { Mapper } from "@/infra/entity/mapper";
import { Service } from "diod";
import { FilterType } from "@/resources/filter/types";
import { FilterSchemaProps } from "./schema";
import { FilterEntity } from "./entity";

/**
 * Mapper class for converting between FilterEntity and FilterSchemaProps.
 */
@Service()
export class FilterMapper implements Mapper<FilterEntity, FilterSchemaProps, any> {
  /**
   * Converts a FilterEntity to a FilterSchemaProps.
   * @param entity - The entity to convert.
   * @returns The converted entity.
   */
  toPeristence(entity: FilterEntity): FilterSchemaProps {
    const copy = entity.getProps();
    return {
      _id: copy.id,
      id: copy.type === FilterType.MOVIE ? 'movie_filters' : 'tv_filters',
      data: {
        rows: copy.filters.map((r) => ({
            condition: r.condition,
            operator: r.operator,
            value: r.value,
            comparison: r.comparison,
          })),
        action: copy.actions.map((a) => ({
            server: a.server,
            path: a.path,
            profile: a.profile,
            language: a.language,
            tag: a.tag,
            type: a.type,
          })),
        collapse: copy.collapse,
      }
    };
  }

  /**
   * Converts a FilterSchemaProps to a FilterEntity.
   * @param record - The record to convert.
   * @returns The converted record.
   */
  toEntity(record: FilterSchemaProps): FilterEntity {
    return new FilterEntity({
      id: record._id,
      props: {
        type: record.id === 'tv_filters' ? FilterType.SHOW : FilterType.MOVIE,
        filters: record.data.rows.map((r) => ({
            condition: r.condition,
            operator: r.operator,
            value: r.value,
            comparison: r.comparison,
          })),
        actions: record.data.action.map((a) => ({
            server: a.server,
            path: a.path,
            profile: a.profile,
            language: a.language,
            tag: a.tag,
            type: a.type,
          })),
        collapse: record.data.collapse,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Converts a FilterEntity to a response object.
   * @param entity - The entity to convert.
   * @returns The converted response.
   */
  toResponse(entity: FilterEntity): any {
    const copy = entity.getProps();
    return {
      id: copy.id,
      type: copy.type,
      filters: copy.filters,
      actions: copy.actions,
      collapse: copy.collapse,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }
}
