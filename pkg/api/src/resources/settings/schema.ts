import { Schema } from 'mongoose';

import { BaseEntityProps } from '@/infra/entity/entity';

import { SettingsProps } from './types';

/**
 * Represents the properties of a Settings schema.
 */
export type SettingsSchemaProps = BaseEntityProps & SettingsProps;

/**
 * Represents the Settings schema.
 */
export const SettingsSchema = new Schema<SettingsSchemaProps>({
  id: { type: String, required: true, unique: true, index: true },
  popularContent: { type: Boolean, required: true },
  authType: { type: Number, required: true },
  appKeys: { type: [String], required: true },
  initialCache: { type: Boolean, required: true },
  initialSetup: { type: Boolean, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});
