import { modelOptions, prop } from "@typegoose/typegoose";
import { BaseSchema } from "../base";
import { AuthTypes } from "./dto";

@modelOptions({ schemaOptions: { collection: 'settings' } })
export default class SettingsSchema extends BaseSchema {
  @prop()
  public plexPopular: boolean;

  @prop({ type: Number, enum: AuthTypes, default: false })
  public authType: AuthTypes;

  @prop()
  public initialCache: boolean;
}
