import mongoose from 'mongoose';

import { IMediaServer, MediaServerID, MediaServerType } from './dto';
import { NotCreatedError, NotCreatedOrUpdatedError, NotDeletedError, NotFoundError, NotUpdatedError, RepositoryError, NotRemovedError, NotRestoredError } from "./errors";
import { MediaServerModel } from './model';
import { IMediaServerRepository } from './repository';
import { inject, injectable } from "tsyringe";
import { Logger } from "winston";

@injectable()
export default class MediaServerDB implements IMediaServerRepository {
  private model: mongoose.Model<IMediaServer> = MediaServerModel;

  constructor(
    @inject("Logger") private logger: Logger,
  ) {}

  public async findById(
    id: MediaServerID,
    deleted?: boolean,
  ): Promise<IMediaServer | RepositoryError> {
    let filters: Record<string, any> = {};
    if (!deleted) {
      filters = { ...filters, deletedAt: null };
    }

    const result = await this.model
      .findOne({ id, ...filters })
      .exec()
      .catch((error) => {
        this.logger.error(error);
        return null;
      });
    if (!result) {
      return NotFoundError;
    }

    return result.toObject();
  }

  public async findByType(
    type: MediaServerType,
    deleted?: boolean,
  ): Promise<IMediaServer[]> {
    let filters: Record<string, any> = {};
    if (!deleted) {
      filters = { ...filters, deletedAt: null };
    }

    const results = await this.model.find({ type, ...filters }).exec().catch((error) => {
      this.logger.error(error);
      return null;
    });
    if (!results) {
      return [];
    }

    return results.map((i) => i.toObject());
  }

  public async getAll(deleted?: boolean): Promise<IMediaServer[]> {
    let filters: Record<string, any> = {};
    if (!deleted) {
      filters = { ...filters, deletedAt: null };
    }

    const results = await this.model.find({ ...filters }).exec().catch((error) => {
      this.logger.error(error);
      return null;
    });
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
  ): Promise<IMediaServer | RepositoryError> {
    const result = await this.model.create({
      type,
      name,
      url,
      token,
      enabled,
    }).catch((error) => {
      this.logger.error(error);
      return null;
    });
    if (!result) {
      return NotCreatedError;
    }
    return result.toObject();
  }

  public async updateById(
    id: MediaServerID,
    name?: string,
    url?: URL,
    token?: string,
    enabled?: boolean,
  ): Promise<IMediaServer | RepositoryError> {
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
      .exec().catch(error => {
        this.logger.error(error);
        return null;
      });
    if (!result) {
      return NotUpdatedError;
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
      .exec().catch((error) => {
        this.logger.error(error);
        return null;
      });
    if (!result) {
      return NotCreatedOrUpdatedError;
    }

    return result.toObject();
  }

  public async deleteById(id: MediaServerID): Promise<IMediaServer | RepositoryError> {
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
      .exec().catch((error) => {
        this.logger.error(error)
        return null;
      });
    if (!result) {
      return NotDeletedError;
    }

    return result.toObject();
  }

  public async removeById(id: MediaServerID): Promise<boolean | RepositoryError> {
    const result = await this.model.deleteOne({ id }).exec().catch((error) => {
      this.logger.error(error);
      return null;
    });
    if (!result || !result.deletedCount) {
      return NotRemovedError;
    }

    return true;
  }

  public async restoreById(id: MediaServerID): Promise<IMediaServer | RepositoryError> {
    const result = await this.model
      .findOneAndUpdate(
        { id },
        {
          deleted: false,
          deletedAt: null,
        },
      )
      .exec().catch((error) => {
        this.logger.error(error);
        return null;
      });
    if (!result) {
      return NotRestoredError;
    }

    return result.toObject();
  }
}
