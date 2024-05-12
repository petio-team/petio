import { Schema } from 'mongoose';

/**
 * Represents the properties of a Filter schema.
 */
export type FilterSchemaProps = {
  _id: string;
  id: string;
  data: {
    rows: {
      condition: string;
      operator: string;
      value: string;
      comparison: string;
    }[];
    action: {
      server: string;
      path: string;
      profile: string;
      language: string;
      tag: string;
      type?: string;
    }[];
    collapse: boolean;
  };
};

/**
 * Represents the Filter schema.
 */
export const FilterSchema = new Schema<FilterSchemaProps>({
  id: { type: String, required: true, unique: true, index: true },
  data: {
    rows: [
      {
        condition: { type: String, required: true },
        operator: { type: String, required: true },
        value: { type: String, required: true },
        comparison: { type: String, required: true },
      },
    ],
    action: [
      {
        server: { type: String, required: true, ref: 'Downloader' },
        path: { type: String, required: true },
        profile: { type: String, required: true },
        language: { type: String, required: true },
        tag: { type: String, required: true },
        type: { type: String },
      },
    ],
    collapse: { type: Boolean, required: true },
  },
});
