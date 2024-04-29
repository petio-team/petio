import fs from 'fs/promises';
import path from 'path';

import { HasConfig } from '@/config/index';
import Migrate from '@/config/migration';
import logger from '@/infra/logger/logger';
import { fileExists } from '@/utils/file';

export default async (): Promise<boolean> => {
  const exists = await HasConfig();
  if (!exists) {
    const contents = await Migrate();
    if (contents) {
      logger.info('Found old config files and started migration process');
      if (process.pkg) {
        // pkg exists so we are using the binary, so for users using the binary we want to
        // check if they already have an .env file and if they do and the DATABASE_URL if,
        // it is not currently set, then we want to append it to the .env or we create the
        // .env file and add it ourselves
        const envFile = path.join(process.cwd(), '.env');
        const hasEnvFile = await fileExists(envFile);
        if (hasEnvFile) {
          if (!process.env.DATABASE_URL) {
            logger.info('Adding DATABASE_URL to .env file');
            await fs.appendFile(envFile, `DATABASE_URL=${contents.DB_URL}`);
          }
        } else {
          logger.info('Creating .env file and adding DATABASE_URL');
          await fs.writeFile(envFile, `DATABASE_URL=${contents.DB_URL}`);
        }
      }
      // TODO! This is a temporary solution to get the app running
      // TODO! We need to handle the migrating data to the db
    }
  }
  return true;
};
