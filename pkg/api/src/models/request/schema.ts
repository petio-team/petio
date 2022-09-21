import { prop, Ref } from "@typegoose/typegoose";
import { BaseSchema } from "../base";
import { MediaServerSchema } from "../mediaserver/schema";
import { UserSchema } from "../user/schema";
import { RequestType } from "./dto";

export class RequestSchema extends BaseSchema {
  @prop()
  type: RequestType;

  @prop()
  title: string;

  @prop()
  thumbnail: string;

  @prop()
  mediaid: string;

  @prop({ ref: () => UserSchema })
  users?: Ref<UserSchema, string>[];

  @prop({ ref: () => MediaServerSchema })
  mediaservers: Ref<MediaServerSchema>[];

  @prop()
  seasons: number[];

  @prop()
  status: number;
}
