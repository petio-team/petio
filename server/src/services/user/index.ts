import { ContainerBuilder } from 'diod';

import { UserService } from '@/services/user/user';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(UserService).asSingleton();
};
