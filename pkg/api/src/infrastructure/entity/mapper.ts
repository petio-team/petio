import { BaseEntity } from './entity';

export abstract class Mapper<
  Entity extends BaseEntity<any>,
  DbRecord,
  Response = any,
> {
  abstract toPeristence(entity: Entity): DbRecord;
  abstract toEntity(record: DbRecord): Entity;
  abstract toResponse(entity: Entity): Response;
}
