import { ContainerBuilder } from 'diod';

import { HttpServer } from '@/infrastructure/http/http-server';

export default (builder: ContainerBuilder) => {
  builder.registerAndUse(HttpServer).asSingleton();
};
