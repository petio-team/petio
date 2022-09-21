import { getModelForClass } from '@typegoose/typegoose';

import { RepositoryError } from '../errors';
import { Movie } from './dto';
import { IMovieRepository } from './repo';
import { MovieSchema } from './schema';

export class MovieDB implements IMovieRepository {
  private model = getModelForClass(MovieSchema);

  async GetAll(): Promise<Movie[]> {
    const results = await this.model.find().exec();
    if (!results) {
      return [];
    }

    return results.map((r) => r.toObject());
  }

  async GetById(id: string): Promise<Movie> {
    const result = await this.model.findOne({ id }).exec();
    if (!result) {
      throw new RepositoryError(`failed to get movie by id with id: ${id}`);
    }

    return result.toObject();
  }

  async GetByPlexId(plex_id: string): Promise<Movie> {
    const result = await this.model
      .findOne({
        guids: {
          plex_id,
        },
      })
      .exec();
    if (!result) {
      throw new RepositoryError(
        `failed to get movie by plex id with id: ${plex_id}`,
      );
    }

    return result.toObject();
  }

  async GetByExternalId(
    tmdb_id?: number,
    tvdb_id?: number,
    imdb_id?: string,
  ): Promise<Movie> {
    if (
      tmdb_id === undefined &&
      tvdb_id === undefined &&
      imdb_id === undefined
    ) {
      throw new RepositoryError(`no external source provided for movie`);
    }

    const result = await this.model
      .findOne({
        guids: {
          $or: [tmdb_id, tvdb_id, imdb_id],
        },
      })
      .exec();
    if (!result) {
      throw new RepositoryError(
        `failed to get movie by tmdb id with id: ${tmdb_id}`,
      );
    }

    return result.toObject();
  }

  async Create(movie: Movie): Promise<Movie> {
    const result = await this.model.create(movie);
    if (!result) {
      throw new RepositoryError(`failed to create movie`);
    }

    return result.toObject();
  }

  async UpdateById(movie: Partial<Movie>): Promise<Movie> {
    const { id, ...update } = movie;
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
      throw new RepositoryError(`failed to update by id with id: ${id}`);
    }

    return result.toObject();
  }

  async DeleteById(id: string): Promise<void> {
    const result = await this.model.deleteOne({ id }).exec();
    if (!result.deletedCount) {
      throw new RepositoryError(`failed to delete movie by id with id: ${id}`);
    }
  }
}
