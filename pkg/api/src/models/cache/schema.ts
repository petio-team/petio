import { modelOptions, prop, Severity } from "@typegoose/typegoose";

@modelOptions({ schemaOptions: { collection: 'cache' }, options: { allowMixed: Severity.ALLOW } })
export default class CacheSchema {
  @prop()
  _id: any;

  @prop()
  value: any;

  @prop()
  expiry: Date;
};
