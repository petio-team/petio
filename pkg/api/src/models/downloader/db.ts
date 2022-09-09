import { getModelForClass } from '@typegoose/typegoose';

import { RepositoryError } from '../errors';
import { Downloader } from './dto';
import { IDownloaderRepository } from './repo';
import { DownloaderSchema } from './schema';

export class DownloaderDB implements IDownloaderRepository {
  private model = getModelForClass(DownloaderSchema);

  async GetAll(): Promise<Downloader[]> {
    const results = await this.model.find().exec();
    if (!results) {
      return [];
    }

    return results.map((r) => r.toObject());
  }

  async GetById(id: string): Promise<Downloader> {
    const result = await this.model.findOne({ id }).exec();
    if (!result) {
      throw new RepositoryError(
        `failed to get downloader by id with id: ${id}`,
      );
    }

    return result.toObject();
  }

  async GetByType(type: string): Promise<Downloader[]> {
    const results = await this.model.find({ type }).exec();
    if (!results) {
      return [];
    }

    return results.map((r) => r.toObject());
  }

  async Create(downloader: Downloader): Promise<Downloader> {
    const result = await this.model.create(downloader);
    if (!result) {
      throw new RepositoryError(`failed to create downloader`);
    }

    return result.toObject();
  }

  async UpdateById(downloader: Downloader): Promise<Downloader> {
    const { id, ...update } = downloader;
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
      throw new RepositoryError(
        `failed to update downloader by id with id: ${id}`,
      );
    }

    return result.toObject();
  }

  async DeleteById(id: string): Promise<void> {
    const result = await this.model.deleteOne({ id }).exec();
    if (!result.deletedCount) {
      throw new RepositoryError(
        `failed to delete downloader by id with id: ${id}`,
      );
    }
  }
}
