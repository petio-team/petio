import { IRead, IWrite } from '../base';
import { IMDB } from './dto';

export interface IIMDBRepository extends IWrite<IMDB>, IRead<IMDB> {
  GetByImdbId(imdb_id: string): Promise<IMDB>;
}
