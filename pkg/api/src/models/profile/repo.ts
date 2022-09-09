import { IRead, IWrite } from '../base';
import { Profile } from './dto';

export interface IProfileRepository extends IWrite<Profile>, IRead<Profile> {}
