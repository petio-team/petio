import { Schema } from 'mongoose';

import { PendingFilter } from '@/resources/request/types';

/**
 * Represents the properties of a Request schema.
 */
export type RequestSchemaProps = {
  requestId: string;
  type: string;
  title: string;
  thumb: string;
  imdb_id: string;
  tmdb_id: string;
  tvdb_id: string;
  users: string[];
  sonarrId: string[];
  radarrId: string[];
  approved: boolean;
  manualStatus: number;
  pendingDefault: Record<string, PendingFilter>;
  seasons: Record<number, boolean>;
  timeStamp: Date;
};

/**
 * Represents the Request schema.
 */
export const RequestSchema = new Schema<RequestSchemaProps>({
  requestId: { type: String, required: true, unique: true, index: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  thumb: { type: String, required: true },
  imdb_id: { type: String, required: true },
  tmdb_id: { type: String, required: true },
  tvdb_id: { type: String, required: true },
  users: { type: [String], required: true, ref: 'User' },
  sonarrId: { type: [String], required: true, ref: 'Downloader' },
  radarrId: { type: [String], required: true, ref: 'Downloader' },
  approved: { type: Boolean, required: true },
  manualStatus: { type: Number, required: true },
  pendingDefault: { type: Object, required: true },
  seasons: { type: Object, required: true },
  timeStamp: { type: Date, required: true },
});
