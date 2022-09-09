import { getModelForClass } from '@typegoose/typegoose';

import { RepositoryError } from '../errors';
import { Profile } from './dto';
import { IProfileRepository } from './repo';
import { ProfileSchema } from './schema';

export class ProfileDB implements IProfileRepository {
  private model = getModelForClass(ProfileSchema);

  async GetAll(): Promise<Profile[]> {
    const results = await this.model.find().exec();
    if (!results) {
      return [];
    }

    return results.map((r) => r.toObject());
  }

  async GetById(id: string): Promise<Profile> {
    const result = await this.model.findOne({ id }).exec();
    if (!result) {
      throw new RepositoryError(`failed to get profile by id with id: ${id}`);
    }

    return result.toObject();
  }

  async Create(profile: Profile): Promise<Profile> {
    const result = await this.model.create(profile);
    if (!result.isNew) {
      throw new RepositoryError(`failed to create a new profile`);
    }

    return result.toObject();
  }

  async UpdateById(profile: Profile): Promise<Profile> {
    const { id, ...update } = profile;
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
        `failed to update profile by id with id: ${id}`,
      );
    }

    return result.toObject();
  }

  async DeleteById(id: string): Promise<void> {
    const result = await this.model.deleteOne({ id }).exec();
    if (!result.deletedCount) {
      throw new RepositoryError(
        `failed to delete profile by id with id: ${id}`,
      );
    }
  }
}
