import { prop, Ref } from "@typegoose/typegoose";
import { BaseSchema } from "../base";
import { UserSchema } from "../user/schema";

export class ReviewSchema extends BaseSchema {
  @prop()
  tmdb_id: number;

  @prop()
  score: number;

  @prop()
  comment: string;

  @prop({ type: () => UserSchema })
  user: Ref<UserSchema>;
}
