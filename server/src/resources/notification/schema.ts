import { Schema } from 'mongoose';

import { BaseEntityProps } from '@/infrastructure/entity/entity';

import { NotificationProps } from './types';

/**
 * Represents the properties of a Notification schema.
 */
export type NotificationSchemaProps = BaseEntityProps & NotificationProps;

/**
 * Represents the Notification schema.
 */
export const NotificationSchema = new Schema<NotificationSchemaProps>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  metadata: { type: Object, required: true },
  enabled: { type: Boolean, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});
