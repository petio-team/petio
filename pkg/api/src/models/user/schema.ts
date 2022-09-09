import { prop } from "@typegoose/typegoose";
import { BaseSchema } from "../base";
import { UserRole } from "./dto";

export class UserSchema extends BaseSchema {
  @prop()
  title: string;

  @prop()
  username: string;

  @prop()
  password: string;

  @prop({ unique: true })
  email: string;

  @prop()
  thumbnail: string;

  @prop()
  altId: string;

  @prop()
  plexId: string;

  @prop()
  role: UserRole;

  @prop({ ref: 'Profile', type: () => String })
  profileId: string;

  @prop()
  owner: boolean;

  @prop()
  custom: boolean;

  @prop()
  disabled: boolean;

  @prop()
  quoteCount: number;

  @prop()
  lastIp: string;

  @prop()
  lastLogin: Date;
}
