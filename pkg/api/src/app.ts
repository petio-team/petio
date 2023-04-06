import 'reflect-metadata';

import('dotenv/config');

//
// Loads the app via loaders module and catches any app errors
//
(async () => {
  (await import('./loaders')).default().catch((error) => {
    console.log('something unexpected went wrong');
    console.log(error);
  });
})();
