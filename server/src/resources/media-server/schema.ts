import { Schema } from 'mongoose';

import { BaseEntityProps } from '@/infrastructure/entity/entity';

import { MediaServerProps } from './types';

/**
 * Represents the properties of a MediaServer schema.
 */
export type MediaServerSchemaProps = BaseEntityProps & MediaServerProps;

/**
 * Represents the MediaServer schema.
 */
export const MediaServerSchema = new Schema<MediaServerSchemaProps>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  url: { type: String, required: true },
  token: { type: String, required: true },
  enabled: { type: Boolean, required: true },
  metadata: { type: Object, required: true },
  libraries: { type: [String], required: true, ref: 'MediaLibrary' },
  users: { type: [String], required: true, ref: 'User' },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});
