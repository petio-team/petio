import { Schema } from 'mongoose';

/**
 * Represents the properties of a Archive schema.
 */
export type ArchiveSchemaProps = {
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
  removed: boolean;
  removed_reason: string;
  complete: boolean;
  timeStamp: Date;
};

/**
 * Represents the Archive schema.
 */
export const ArchiveSchema = new Schema<ArchiveSchemaProps>({
  requestId: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  thumb: { type: String, required: true },
  imdb_id: { type: String, required: true },
  tmdb_id: { type: String, required: true },
  tvdb_id: { type: String, required: true },
  users: { type: [String], required: true },
  sonarrId: { type: [String], required: true },
  radarrId: { type: [String], required: true },
  approved: { type: Boolean, required: true },
  removed: { type: Boolean, required: true },
  removed_reason: { type: String, required: true },
  complete: { type: Boolean, required: true },
  timeStamp: { type: Date, required: true },
});
