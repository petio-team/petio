import { Schema } from 'mongoose';

import { BaseEntityProps } from '@/infra/entity/entity';

import { NotificationProps } from './types';

export type NotificationSchemaProps = BaseEntityProps & NotificationProps;
export const NotificationSchema = new Schema<NotificationSchemaProps>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, required: true },
  metadata: { type: Object, required: true },
  enabled: { type: Boolean, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});
