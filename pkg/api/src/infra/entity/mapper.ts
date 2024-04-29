import { BaseEntity } from "./entity";

export interface Mapper<
  Entity extends BaseEntity<any>,
  DbRecord,
  Response = any,
> {
  toPeristence(entity: Entity): DbRecord;
  toEntity(record: DbRecord): Entity;
  toResponse(entity: Entity): Response;
}
