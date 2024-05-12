import { Schema } from 'mongoose';

/**
 * Represents the properties of a Imdb schema.
 */
export type ImdbSchemaProps = {
  _id: string;
  rating: string;
};

/**
 * Represents the Imdb schema.
 */
export const ImdbSchema = new Schema<ImdbSchemaProps>({
  rating: { type: String, required: true },
});
