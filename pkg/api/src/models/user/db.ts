import { getModelForClass } from '@typegoose/typegoose';

import { RepositoryError } from '../errors';
import { User } from './dto';
import { IUserRepository } from './repo';
import { UserSchema } from './schema';

export class UserDB implements IUserRepository {
  private model = getModelForClass(UserSchema);

  async GetAll(): Promise<User[]> {
    const results = await this.model.find({}).exec();
    return results.map((r) => r.toObject());
  }

  async GetById(id: string): Promise<User> {
    const result = await this.model.findOne({ id }).exec();
    if (!result) {
      throw new RepositoryError(`failed to get user by id with id: ${id}`);
    }

    return result.toObject();
  }

  async GetByEmail(email: string): Promise<User> {
    const result = await this.model.findOne({ email }).exec();
    if (!result) {
      throw new RepositoryError(
        `failed to get user by email with email: ${email}`,
      );
    }

    return result.toObject();
  }

  async GetByPlexId(plex_id: string): Promise<User> {
    const result = await this.model.findOne({ plexId: plex_id }).exec();
    if (!result) {
      throw new RepositoryError(
        `failed to get user by plex id with id: ${plex_id}`,
      );
    }

    return result.toObject();
  }

  async Create(user: User): Promise<User> {
    const result = await this.model.create(user);
    if (!result) {
      throw new RepositoryError(`failed to create user`);
    }

    return result.toObject();
  }

  async UpdateById(user: Partial<User>): Promise<User> {
    const { id, ...update } = user;
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
      throw new RepositoryError(`failed to update user by id with id: ${id}`);
    }

    return result.toObject();
  }

  async CreateOrUpdate(user: User): Promise<User> {
    const { id, email, ...update } = user;
    const result = await this.model
      .findOneAndUpdate(
        {
          $or: [{ id }, { email }],
        },
        {
          email,
          ...update,
        },
        {
          upsert: true,
        },
      )
      .exec();
    if (!result) {
      throw new RepositoryError('failed to create or update user');
    }

    return result.toObject();
  }

  async DeleteById(id: string): Promise<void> {
    const result = await this.model.deleteOne({ id }).exec();
    if (!result.deletedCount) {
      throw new RepositoryError(`failed to delete user by id with id: ${id}`);
    }
  }
}
