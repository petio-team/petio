import { Schema } from 'mongoose';

import { BaseEntityProps } from '@/infra/entity/entity';

import { SettingsProps } from './types';

export type SettingsSchemaProps = BaseEntityProps & SettingsProps;
export const SettingsSchema = new Schema<SettingsSchemaProps>({
  id: { type: String, required: true },
  popularContent: { type: Boolean, required: true },
  authType: { type: Number, required: true },
  initialCache: { type: Boolean, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});
