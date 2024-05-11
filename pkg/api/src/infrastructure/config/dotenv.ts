import dotenv from 'dotenv';
import { join } from 'path';

import { DATA_DIR, NODE_ENV } from '@/infrastructure/config/env';

export const tryLoadEnv = () => {
  dotenv.config({
    override: true,
    path:
      NODE_ENV === 'docker'
        ? join(DATA_DIR, '.env')
        : join(process.cwd(), '.env'),
  });
};
