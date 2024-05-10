import { Schema } from 'mongoose';

/**
 * Represents the properties of a Issue schema.
 */
export type IssueSchemaProps = {
  mediaId: string;
  type: string;
  title: string;
  issue: string;
  comment: string;
  tmdbId: number;
  user: string;
  sonarrId: string[];
  radarrId: string[];
};

/**
 * Represents the Issue schema.
 */
export const IssueSchema = new Schema<IssueSchemaProps>({
  mediaId: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  issue: { type: String, required: true },
  comment: { type: String, required: true },
  tmdbId: { type: Number, required: true },
  user: { type: String, required: true, ref: 'User' },
  sonarrId: [{ type: String, required: true, ref: 'Downloader' }],
  radarrId: [{ type: String, required: true, ref: 'Downloader' }],
});
