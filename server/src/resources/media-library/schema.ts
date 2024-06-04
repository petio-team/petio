import { Schema } from 'mongoose';

/**
 * Represents the properties of a MediaLibrary schema.
 */
export type MediaLibrarySchemaProps = {
  id: string;
  allowSync: boolean;
  art: string;
  composite: string;
  filters: boolean;
  refreshing: boolean;
  thumb: string;
  key: string;
  type: string;
  title: string;
  agent: string;
  scanner: string;
  language: string;
  uuid: string;
  updatedAt: number;
  createdAt: number;
  scannedAt: number;
  content: boolean;
  directory: boolean;
  contentChangedAt: number;
  hidden: number;
};

/**
 * Represents the MediaLibrary schema.
 */
export const MediaLibrarySchema = new Schema<MediaLibrarySchemaProps>({
  allowSync: Boolean,
  art: String,
  composite: String,
  filters: Boolean,
  refreshing: Boolean,
  thumb: String,
  key: String,
  type: String,
  title: String,
  agent: String,
  scanner: String,
  language: String,
  uuid: String,
  updatedAt: Number,
  createdAt: Number,
  scannedAt: Number,
  content: Boolean,
  directory: Boolean,
  contentChangedAt: Number,
  hidden: Number,
});
