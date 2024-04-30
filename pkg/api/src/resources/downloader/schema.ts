import { Schema } from 'mongoose';

import { BaseEntityProps } from '@/infra/entity/entity';

import { DownloaderProps } from './types';

export type DownloaderSchemaProps = BaseEntityProps & DownloaderProps;
export const DownloaderSchema = new Schema<DownloaderSchemaProps>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  url: { type: String, required: true },
  token: { type: String, required: true },
  metadata: { type: Object, required: true },
  enabled: { type: Boolean, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});
