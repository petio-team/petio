import { Schema, model, Document } from "mongoose";
import { ComingSoon } from "./model";
import mongooseHidden from "mongoose-hidden";

const schema = new Schema({
  type: { type: String, required: true },
  id: { type: Number, required: true },
  available: { type: Boolean, required: true },
  title: { type: String, required: true },
  posterPath: { type: String },
  date: { type: String, required: true },
  videos: [
    {
      title: { type: String, required: true },
      key: { type: String, required: true },
    },
  ],
});

schema.plugin(mongooseHidden(), { applyRecursively: true });

export const Model = model<ComingSoon & Document>("ComingSoon", schema);
