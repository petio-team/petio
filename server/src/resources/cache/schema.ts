import { Schema } from 'mongoose';

import { CacheProps } from './types';

/**
 * Represents the properties of a Cache schema.
 */
export type CacheSchemaProps = CacheProps & {
  id: string;
};

/**
 * Represents the Cache schema.
 */
export const CacheSchema = new Schema<CacheSchemaProps>({
  id: { type: String, required: true, unique: true, indexes: true },
  key: { type: String, required: true, unique: true, indexes: true },
  value: { type: Schema.Types.Mixed, required: true },
  expires: { type: Date, required: true },
});
