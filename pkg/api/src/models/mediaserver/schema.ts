import { prop } from "@typegoose/typegoose";
import { BaseSchema } from "../base";
import { MediaServerType } from "./dto";

export class MediaServerSchema extends BaseSchema {
  @prop({ required: true })
  type: MediaServerType;

  @prop({ required: true })
  name: string;

  @prop({ required: true, unique: true })
  url: string;

  @prop({ required: true })
  token: string;

  @prop({ required: true })
  enabled: boolean;

  @prop()
  deletedAt: boolean;
}
