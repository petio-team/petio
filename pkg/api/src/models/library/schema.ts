import { prop } from "@typegoose/typegoose";
import { BaseSchema } from "../base";

export class LibrarySchema extends BaseSchema {
  @prop()
  key: string;

  @prop()
  title: string;

  @prop()
  agent: string;

  @prop()
  language: string;

  @prop()
  uuid: string;

  @prop()
  libraryScannedAt: number;

  @prop()
  libraryUpdatedAt: number;

  @prop()
  contentChangedAt: number;

  @prop()
  enabled: boolean;
}
