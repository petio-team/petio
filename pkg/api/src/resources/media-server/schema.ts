import { Schema } from 'mongoose';

import { BaseEntityProps } from '@/infra/entity/entity';

import { MediaServerProps } from './types';

export type MediaServerSchemaProps = BaseEntityProps & MediaServerProps;
export const MediaServerSchema = new Schema<MediaServerSchemaProps>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  enabled: { type: Boolean, required: true },
  metadata: { type: Object, required: true },
  libraries: { type: [String], required: true },
  users: { type: [String], required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});
