import { prop } from "@typegoose/typegoose";
import { BaseSchema } from "../base";

export class IMDBSchema extends BaseSchema {
  @prop({ index: true })
  imdb_id: string;

  @prop()
  rating: number;
}
