import { Schema } from 'mongoose';

/**
 * Represents the properties of a Review schema.
 */
export type ReviewSchemaProps = {
  _id: string;
  tmdb_id: string;
  score: number;
  comment: string;
  user: string;
  date: Date;
  type: string;
  title: string;
};

/**
 * Represents the Review schema.
 */
export const ReviewSchema = new Schema<ReviewSchemaProps>({
  tmdb_id: { type: String, required: true },
  score: { type: Number, required: true },
  comment: { type: String, required: true },
  user: { type: String, required: true, ref: 'User' },
  date: { type: Date, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
});
