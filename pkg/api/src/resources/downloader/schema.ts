import { Schema } from 'mongoose';

import { BaseEntityProps } from '@/infra/entity/entity';

import { DownloaderProps } from './types';

/**
 * Represents the properties of a Downloader schema.
 */
export type DownloaderSchemaProps = BaseEntityProps & DownloaderProps;

/**
 * Represents the Downloader schema.
 */
export const DownloaderSchema = new Schema<DownloaderSchemaProps>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  url: { type: String, required: true, unique: true },
  token: { type: String, required: true },
  metadata: { type: Object, required: true },
  enabled: { type: Boolean, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});
