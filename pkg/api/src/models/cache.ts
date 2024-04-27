import mongoose from 'mongoose';

export type Cache = {
  key: string;
  value: any;
  expiry: Date;
};

const CacheSchema = new mongoose.Schema({
  key: String,
  value: mongoose.Schema.Types.Mixed,
  expiry: Date,
});

const CacheModel = mongoose.model<Cache>('Cache', CacheSchema, 'cache');
export default CacheModel;
