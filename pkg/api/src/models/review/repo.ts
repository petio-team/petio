import { IRead, IWrite } from '../base';
import { Review } from './dto';

export interface IReviewRepository extends IWrite<Review>, IRead<Review> {
  GetByExternalId(tmdb_id: number): Promise<Review>;
}
