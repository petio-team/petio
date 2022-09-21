import { prop } from "@typegoose/typegoose";
import { BaseSchema } from "../base";

export class NotificationSchema extends BaseSchema {
  @prop({ unique: true, index: true })
  public url: string;

  @prop()
  public enabled: boolean;
}
