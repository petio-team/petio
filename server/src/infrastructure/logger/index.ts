import { ContainerBuilder } from 'diod';

import logger, { Logger } from '@/infrastructure/logger/logger';

export default (builder: ContainerBuilder) => {
  builder.register(Logger).useInstance(logger);
};
