import 'reflect-metadata';

import logger from './infra/logger/logger';

import('dotenv/config');

declare global {
  namespace NodeJS {
    interface Process {
      pkg?: any;
    }
  }
}

//
// Loads the app via loaders module and catches any app errors
//
(async () => {
  (await import('./loaders')).default().catch((error) => {
    logger.error('something unexpected went wrong', error);
  });
})();
