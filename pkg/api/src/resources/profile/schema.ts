import { Schema } from 'mongoose';

/**
 * Represents the properties of a Profile schema.
 */
export type ProfileSchemaProps = {
  _id: string;
  name: string;
  sonarr: Record<string, unknown>;
  radarr: Record<string, unknown>;
  autoApprove: boolean;
  autoApproveTv: boolean;
  quota: number;
  isDefault: boolean;
};

/**
 * Represents the Profile schema.
 */
export const ProfileSchema = new Schema<ProfileSchemaProps>({
  name: { type: String, required: true },
  sonarr: { type: Object, required: true },
  radarr: { type: Object, required: true },
  autoApprove: { type: Boolean, required: true },
  autoApproveTv: { type: Boolean, required: true },
  quota: { type: Number, required: true },
  isDefault: { type: Boolean, required: true },
});
