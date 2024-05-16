import { Schema } from 'mongoose';

/**
 * Represents the properties of a User schema.
 */
export type UserSchemaProps = {
  _id: string;
  title: string;
  username: string;
  password?: string;
  email: string;
  thumbnail?: string;
  custom_thumb?: string;
  altId?: string;
  plexId?: string;
  role: string;
  profileId?: string;
  owner: boolean;
  custom: boolean;
  disabled: boolean;
  quotaCount: number;
  lastLogin?: Date;
  lastIp?: string;
};

/**
 * Represents the User schema.
 */
export const UserSchema = new Schema<UserSchemaProps>({
  title: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: false },
  email: { type: String, required: true },
  thumbnail: { type: String, required: false },
  custom_thumb: { type: String, required: false },
  altId: { type: String, required: false },
  plexId: { type: String, required: false },
  role: { type: String, required: true },
  profileId: { type: String, required: false },
  owner: { type: Boolean, required: true },
  custom: { type: Boolean, required: true },
  disabled: { type: Boolean, required: true },
  quotaCount: { type: Number, required: true },
  lastLogin: { type: Date, required: false },
  lastIp: { type: String, required: false },
});
