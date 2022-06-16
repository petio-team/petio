import 'module-alias/register';
import 'reflect-metadata';

import('dotenv/config');
import('cache-manager/lib/stores/memory');

(async () => {
  (await import('./loaders')).default().catch((error) => {
    console.log('something unexpected went wrong');
    console.log(error);
  });
})();
