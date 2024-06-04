import { ExceptionBase } from '@/infrastructure/exceptions/base';

export class MovieNotFoundException extends ExceptionBase {
  static readonly message = 'Movie not found';

  readonly code = 'MOVIE_NOT_FOUND';

  constructor(message = MovieNotFoundException.message) {
    super(message);
  }
}
