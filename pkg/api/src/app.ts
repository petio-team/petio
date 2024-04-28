import 'reflect-metadata';
import logger from './loaders/logger';

import('dotenv/config');

//
// Loads the app via loaders module and catches any app errors
//
(async () => {
  (await import('./loaders')).default().catch((error) => {
    logger.error('something unexpected went wrong', error);
  });
})();

