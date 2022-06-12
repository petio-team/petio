import mongoose from 'mongoose';

import { IMediaServer, MediaServerID, MediaServerType } from './dto';
import { IMediaServerRepository, RepositoryError } from './repository';
import { MediaServerModel } from './schema';

export default class MediaServerDB implements IMediaServerRepository {
  private model: mongoose.Model<IMediaServer> = MediaServerModel;

  public async GetMediaServerById(
    id: MediaServerID,
  ): Promise<IMediaServer | RepositoryError> {
    const result = await this.model.findOne({ id }).exec();
    if (!result) {
      return RepositoryError.NotFound;
    }

    return result.toObject();
  }

  public async findById(
    id: MediaServerID,
    filters: Object,
  ): Promise<IMediaServer> {
    const result = await this.model.findOne({ id, ...filters }).exec();
    if (!result) {
      throw new Error(RepositoryError.NotFound);
    }

    return result.toObject();
  }

  public async findByType(
    type: MediaServerType,
    filters: Object,
  ): Promise<IMediaServer[]> {
    const results = await this.model.find({ type, ...filters }).exec();
    if (!results) {
      return [];
    }

    return results.map((i) => i.toObject());
  }

  public async findByFilter(filters: Object): Promise<IMediaServer> {
    const result = await this.model.findOne({ ...filters }).exec();
    if (!result) {
      throw new Error(RepositoryError.NotFound);
    }

    return result.toObject();
  }

  public async getAll(filters: Object): Promise<IMediaServer[]> {
    const results = await this.model.find({ ...filters }).exec();
    if (!results) {
      return [];
    }

    return results.map((i) => i.toObject());
  }
  public async create(
    type: MediaServerType,
    name: string,
    url: URL,
    token: string,
    enabled: boolean,
  ): Promise<IMediaServer> {
    const result = await this.model.create({
      type,
      name,
      url,
      token,
      enabled,
    });
    if (!result._id) {
      throw new Error(RepositoryError.NotCreated);
    }
    return result.toObject();
  }

  public async updateById(
    id: MediaServerID,
    name?: string,
    url?: URL,
    token?: string,
    enabled?: boolean,
  ): Promise<IMediaServer> {
    const result = await this.model
      .findOneAndUpdate(
        { id },
        {
          name,
          url,
          token,
          enabled,
        },
        {
          new: true,
        },
      )
      .exec();
    if (!result) {
      throw new Error(RepositoryError.NotUpdated);
    }

    return result.toObject();
  }

  public async createOrUpdate(
    id: MediaServerID,
    type: MediaServerType,
    name: string,
    url: URL,
    token: string,
    enabled: boolean,
  ) {
    const result = await this.model
      .findOneAndUpdate(
        { id },
        {
          type,
          name,
          url,
          token,
          enabled,
        },
        {
          upsert: true,
        },
      )
      .exec();
    if (!result) {
      throw new Error(RepositoryError.NotCreatedOrUpdated);
    }

    return result.toObject();
  }

  public async deleteById(id: MediaServerID): Promise<IMediaServer> {
    const result = await this.model
      .findOneAndUpdate(
        { id },
        {
          deletedAt: new Date().toDateString(),
        },
        {
          new: true,
        },
      )
      .exec();
    if (!result) {
      throw new Error(RepositoryError.NotDeleted);
    }

    return result.toObject();
  }

  public async removeById(id: MediaServerID): Promise<boolean> {
    const result = await this.model.deleteOne({ id }).exec();
    if (!result.deletedCount) {
      throw new Error(RepositoryError.NotRemoved);
    }

    return true;
  }

  public async restoreById(id: MediaServerID): Promise<IMediaServer> {
    const result = await this.model
      .findOneAndUpdate(
        { id },
        {
          deleted: false,
          deletedAt: null,
        },
      )
      .exec();
    if (!result) {
      throw new Error(RepositoryError.NotRestored);
    }

    return result.toObject();
  }
}
