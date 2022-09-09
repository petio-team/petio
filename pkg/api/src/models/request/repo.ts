import { IRead, IWrite } from '../base';
import { Request } from './dto';

export interface IRequestRepository extends IWrite<Request>, IRead<Request> {
  RemoveById(id: string): Promise<Request>;
}
