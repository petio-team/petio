import { getModelForClass } from '@typegoose/typegoose';

import { RepositoryError } from '../errors';
import { Issue } from './dto';
import { IIssueRepository } from './repo';
import { IssueSchema } from './schema';

export class IssueDB implements IIssueRepository {
  private model = getModelForClass(IssueSchema);

  async GetAll(): Promise<Issue[]> {
    const results = await this.model.find().exec();
    if (!results) {
      return [];
    }

    return results.map((r) => r.toObject());
  }

  async GetById(id: string): Promise<Issue> {
    const result = await this.model.findOne({ id }).exec();
    if (!result) {
      throw new RepositoryError(`failed to get issue by id with id: ${id}`);
    }

    return result.toObject();
  }

  async GetByTmdbId(tmdb_id: number): Promise<Issue> {
    const result = await this.model.findOne({ tmdb_id }).exec();
    if (!result) {
      throw new RepositoryError(
        `failed to get issue by tmdbid with id: ${tmdb_id}`,
      );
    }

    return result.toObject();
  }

  async Create(issue: Issue): Promise<Issue> {
    const result = await this.model.create(issue);
    if (!result) {
      throw new RepositoryError(`failed to create issue`);
    }

    return result.toObject();
  }

  async UpdateById(issue: Partial<Issue>): Promise<Issue> {
    const { id, ...update } = issue;
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
      throw new RepositoryError(`failed to update issue by id with id: ${id}`);
    }

    return result.toObject();
  }

  async DeleteById(id: string): Promise<void> {
    const result = await this.model.deleteOne({ id }).exec();
    if (!result.deletedCount) {
      throw new RepositoryError(`failed to delete issue by id with id: ${id}`);
    }
  }
}
