import { ContainerBuilder } from 'diod';

import logger, { Logger } from '@/infra/logger/logger';

export default (builder: ContainerBuilder) => {
  builder.register(Logger).useInstance(logger);
};
