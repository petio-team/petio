import mongoose from 'mongoose';
import { z } from 'zod';

const RequestZodSchema = z.object({
  requestId: z.string(),
  type: z.string(),
  title: z.string(),
  thumb: z.string(),
  imdb_id: z.string(),
  tmdb_id: z.string(),
  tvdb_id: z.string(),
  users: z.array(z.string()),
  sonarrId: z.array(z.string()),
  radarrId: z.array(z.string()),
  approved: z.boolean(),
  manualStatus: z.number(),
  pendingDefault: z.unknown(),
  seasons: z.unknown(),
  timeStamp: z.date(),
});
export type IRequest = z.infer<typeof RequestZodSchema>;

const RequestSchema = new mongoose.Schema<IRequest>({
  requestId: String,
  type: String,
  title: String,
  thumb: String,
  imdb_id: String,
  tmdb_id: String,
  tvdb_id: String,
  users: Array,
  sonarrId: Array,
  radarrId: Array,
  approved: Boolean,
  manualStatus: Number,
  pendingDefault: Object,
  seasons: Object,
  timeStamp: Date,
});

export default mongoose.model<IRequest>('Request', RequestSchema);
