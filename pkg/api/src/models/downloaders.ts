import { randomUUID as uuidv4 } from 'crypto';
import { Document, Schema, model } from 'mongoose';

export enum DownloaderType {
  Sonarr = 'sonarr',
  Radarr = 'radarr',
}

export interface IDownloader {
  id?: string;
  name: string;
  type: DownloaderType;
  url: string;
  token: string;
  version: string;
  path: number;
  profile: number;
  language: number;
  availability: number;
  enabled: boolean;
}

export const DownloaderModelSchema = new Schema<IDownloader>(
  {
    id: {
      type: String,
      default: uuidv4(),
      unique: true,
      immutable: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      required: true,
    },
    path: {
      type: Number,
      required: true,
      default: 0,
    },
    profile: {
      type: Number,
      required: true,
      default: 0,
    },
    language: {
      type: Number,
      required: true,
      default: 0,
    },
    availability: {
      type: Number,
      required: true,
      default: 0,
    },
    enabled: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform (_doc, ret, _options) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    _id: false,
    id: false,
  },
);
DownloaderModelSchema.virtuals = true;

export const DownloaderModel = model<IDownloader & Document>(
  'downloaders',
  DownloaderModelSchema,
);

export const GetAllDownloaders = async (
  type?: DownloaderType,
): Promise<IDownloader[]> => {
  let filter: Object = {};
  if (type) {
    filter = { type };
  }

  const downloaders = await DownloaderModel.find(filter).exec();
  if (!downloaders) {
    return [];
  }

  return downloaders;
};

export const GetDownloaderById = async (id: string): Promise<IDownloader> => {
  const downloader = await DownloaderModel.findOne({ id }).exec();
  if (!downloader) {
    throw new Error(`no downloader exists with id: ${  id}`);
  }

  return downloader.toObject();
};

export const CreateDownloader = async (
  data: IDownloader,
): Promise<IDownloader> => {
  const downloader = await DownloaderModel.create(data);
  if (!downloader) {
    throw new Error('failed to create downloader');
  }

  return downloader;
};

export const CreateOrUpdateDownloader = async (
  data: IDownloader,
): Promise<IDownloader> => {
  if (!data.id) {
    data.id = uuidv4();
  }

  const downloader = await DownloaderModel.findOneAndUpdate(
    {
      $or: [
        {
          url: data.url,
        },
        {
          id: data.id,
        },
        {
          $and: [
            {
              name: data.name,
            },
            {
              type: data.type,
            },
          ],
        },
      ],
    },
    {
      $set: {
        id: data.id,
        name: data.name,
        type: data.type,
        url: data.url,
        token: data.token,
        version: data.version,
        path: data.path,
        profile: data.profile,
        language: data.language,
        availability: data.availability,
        enabled: data.enabled,
      },
    },
    {
      upsert: true,
      new: true,
    },
  ).exec();
  if (!downloader) {
    throw new Error('failed to create downloader');
  }

  return downloader;
};

export const UpdateDownloader = async (data: IDownloader): Promise<boolean> => {
  if (!data.id) {
    throw new Error('id is missing');
  }

  const downloader = await DownloaderModel.updateOne(data).exec();
  if (!downloader) {
    throw new Error(`failed to update downloader with id: ${  data.id}`);
  }

  return !!downloader.modifiedCount;
};

export const DeleteDownloaderById = async (id: string): Promise<boolean> => {
  const downloader = await DownloaderModel.deleteOne({ id }).exec();
  if (!downloader) {
    throw new Error(`failed to delete downloader with id: ${  id}`);
  }

  return !!downloader.deletedCount;
};
