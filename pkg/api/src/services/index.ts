import { ContainerBuilder } from 'diod';

import cache from '@/services/cache';
import migration from '@/services/migration';
import scanner from '@/services/scanner';
import settings from '@/services/settings';

export default (builder: ContainerBuilder) => {
  cache(builder);
  scanner(builder);
  migration(builder);
  settings(builder);
};
