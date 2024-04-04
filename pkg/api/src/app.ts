import 'reflect-metadata';

import('dotenv/config');

//
// Loads the app via loaders module and catches any app errors
//
(async () => {
  (await import('./loaders')).default().catch((error) => {
    console.error('something unexpected went wrong');
    console.error(error);
  });
})();
