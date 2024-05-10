import { Schema } from 'mongoose';

import { BaseEntityProps } from '@/infra/entity/entity';

import { DiscoveryProps } from './types';

/**
 * Represents the properties of a Discovery schema.
 */
export type DiscoverySchemaProps = BaseEntityProps & DiscoveryProps;

/**
 * Represents the Discovery schema.
 */
export const DiscoverySchema = new Schema<DiscoverySchemaProps>({
  id: { type: String, required: true, unique: true, index: true },
  movie: {
    genres: Object,
    people: {
      cast: Object,
      director: Object,
    },
    history: Object,
  },
  series: {
    genres: Object,
    people: {
      cast: Object,
      director: Object,
    },
    history: Object,
  },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});
