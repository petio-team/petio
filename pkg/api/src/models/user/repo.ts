import { IRead, IWrite } from '../base';
import { User } from './dto';

export interface IUserRepository extends IWrite<User>, IRead<User> {
  GetByEmail(email: string): Promise<User>;
  GetByPlexId(id: string): Promise<User>;
  CreateOrUpdate(user: User): Promise<User>;
}
