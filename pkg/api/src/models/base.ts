import { randomUUID as uuidv4 } from 'crypto';
import { modelOptions, prop } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

@modelOptions({ schemaOptions: { _id: false, versionKey: false } })
export abstract class BaseSchema extends TimeStamps {
  @prop({ default: uuidv4(), unique: true, immutable: true, index: true })
  public id: string;
}

export interface IRead<T> {
  GetAll(): Promise<T[]>;
  GetById(id: string): Promise<T>;
}

export interface IWrite<T> {
  Create(create: T): Promise<T>;
  UpdateById(update: Partial<T>): Promise<T>;
  DeleteById(id: string): Promise<void>;
}
