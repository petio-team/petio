import { randomUUID as uuidv4 } from 'crypto';
import mongoose from 'mongoose';

import { IMediaServer } from './dto';

const schema = new mongoose.Schema<IMediaServer>(
  {
    id: {
      type: String,
      default: uuidv4(),
      unique: true,
      immutable: true,
      index: true,
    },
    type: { type: String },
    name: { type: String, unqiue: true },
    url: { type: String, unique: true },
    token: { type: String },
    enabled: { type: Boolean },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toObject: {
      transform: function (_doc, ret, _options) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const MediaServerModel = mongoose.model<IMediaServer>(
  'MediaServers',
  schema,
);
