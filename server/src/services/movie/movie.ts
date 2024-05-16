import { Service } from 'diod';
import pino from 'pino';

import { Logger } from '@/infrastructure/logger/logger';
import { movieLookup } from '@/services/tmdb/movie';

@Service()
export class MovieService {
  private logger: pino.Logger;

  constructor(logger: Logger) {
    this.logger = logger.child({ module: 'services.movie' });
  }

  async getBatchedMovies(ids: number[], minified: boolean = false) {
    const movieResult = await Promise.all(
      ids.map((m) => movieLookup(m, minified)),
    );
    return movieResult;
  }
}
