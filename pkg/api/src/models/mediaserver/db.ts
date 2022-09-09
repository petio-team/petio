import { getModelForClass } from '@typegoose/typegoose';

import { RepositoryError } from '../errors';
import { MediaServer, MediaServerType } from './dto';
import { IMediaServerRepository } from './repo';
import { MediaServerSchema } from './schema';

export default class MediaServerDB implements IMediaServerRepository {
  private model = getModelForClass(MediaServerSchema);

  public async GetAll(): Promise<MediaServer[]> {
    const results = await this.model.find().exec();
    if (!results) {
      return [];
    }

    return results.map((i) => i.toObject());
  }

  public async GetById(id: string): Promise<MediaServer> {
    const result = await this.model.findOne({ id }).exec();
    if (!result) {
      throw new RepositoryError(
        `failed to get media server by id with id ${id}`,
      );
    }

    return result.toObject();
  }

  public async GetByType(type: MediaServerType): Promise<MediaServer[]> {
    const results = await this.model.find({ type }).exec();
    if (!results) {
      return [];
    }

    return results.map((i) => i.toObject());
  }

  public async Create(mediaserver: MediaServer): Promise<MediaServer> {
    const result = await this.model.create(mediaserver);
    if (!result) {
      throw new Error(`failed to create media server`);
    }

    return result.toObject();
  }

  public async UpdateById(mediaserver: MediaServer): Promise<MediaServer> {
    const { id, ...update } = mediaserver;
    if (id === undefined) {
      throw new RepositoryError(`invalid or missing id field`);
    }

    const result = await this.model
      .findOneAndUpdate(
        {
          id,
        },
        update,
      )
      .exec();
    if (!result) {
      throw new Error(`failed to update media server by id with id: ${id}`);
    }

    return result.toObject();
  }

  public async CreateOrUpdate(mediaserver: MediaServer): Promise<MediaServer> {
    const { id, ...upsert } = mediaserver;
    const result = await this.model
      .findOneAndUpdate(
        {
          id,
        },
        upsert,
        {
          upsert: true,
        },
      )
      .exec();
    if (!result) {
      throw new Error(
        `failed to create or update media server with url: ${upsert.url}`,
      );
    }

    return result.toObject();
  }

  public async RemoveById(id: string): Promise<void> {
    const result = await this.model
      .findOneAndUpdate(
        {
          id,
        },
        {
          deletedAt: new Date().toDateString(),
        },
        {
          new: true,
        },
      )
      .exec();
    if (!result) {
      throw new Error(`failed to delete media server by id with id: ${id}`);
    }

    return result.toObject();
  }

  public async DeleteById(id: string): Promise<void> {
    const result = await this.model.deleteOne({ id }).exec();
    if (!result.deletedCount) {
      throw new Error(`failed to remove media server by id with id: ${id}`);
    }
  }

  public async RestoreById(id: string): Promise<MediaServer> {
    const result = await this.model
      .findOneAndUpdate(
        { id },
        {
          deletedAt: null,
        },
      )
      .exec();
    if (!result) {
      throw new Error(`failed to restore media server by id with id: ${id}`);
    }

    return result.toObject();
  }
}
