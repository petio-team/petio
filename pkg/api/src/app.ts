import dotenv from 'dotenv';
import 'reflect-metadata';

import logger from './infra/logger/logger';

//
// Loads the app via loaders module and catches any app errors
//
(async () => {
  // Override any env values from the .env file if it exists
  dotenv.config({ override: true });

  (await import('./loaders')).default().catch((error) => {
    logger.error('something unexpected went wrong', error);
  });
})();
