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
  path: {
    id: number;
    location: string;
  };
  profile: {
    id: number;
    name: string;
  };
  language: {
    id: number;
    name: string;
  };
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
    path: {
      id: {
        type: Number,
        required: true,
      },
      location: {
        type: String,
        required: true,
      },
    },
    profile: {
      id: {
        type: Number,
        required: true,
      },
      name: {
        type: String,
      },
    },
    language: {
      id: {
        type: Number,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    enabled: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret, _options) {
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
  const downloader = await DownloaderModel.findById({ id }).exec();
  if (!downloader) {
    throw new Error('no downloader exists with id: ' + id);
  }

  return downloader;
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
          name: data.name,
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
        path: {
          id: data.path.id,
          location: data.path.location,
        },
        profile: {
          id: data.profile.id,
          name: data.profile.name,
        },
        language: {
          id: data.language.id,
          name: data.language.name,
        },
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
    throw new Error('failed to update downloader with id: ' + data.id);
  }

  return downloader.modifiedCount ? true : false;
};

export const DeleteDownloaderById = async (id: string): Promise<boolean> => {
  const downloader = await DownloaderModel.deleteOne({ id }).exec();
  if (!downloader) {
    throw new Error('failed to delete downloader with id: ' + id);
  }

  return downloader.deletedCount ? true : false;
};
