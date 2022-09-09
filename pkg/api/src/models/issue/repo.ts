import { IRead, IWrite } from '../base';
import { Issue } from './dto';

export interface IIssueRepository extends IWrite<Issue>, IRead<Issue> {
  GetByTmdbId(tmdb_id: number): Promise<Issue>;
}
