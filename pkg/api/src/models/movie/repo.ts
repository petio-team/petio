import { IRead, IWrite } from '../base';
import { Movie } from './dto';

export interface IMovieRepository extends IWrite<Movie>, IRead<Movie> {
  GetByPlexId(plex_id: string): Promise<Movie>;
  GetByExternalId(
    tmdb_id?: number,
    tvdb_id?: number,
    imdb_id?: string,
  ): Promise<Movie>;
}
