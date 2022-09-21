import { IRead, IWrite } from '../base';
import { Filter } from './dto';

export interface IFilterRepository extends IWrite<Filter>, IRead<Filter> {}
