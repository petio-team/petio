import 'module-alias/register';
import 'reflect-metadata';

import('dotenv/config');
import('cache-manager/lib/stores/memory');

(async () => {
  (await import('./loaders')).default();
})();
