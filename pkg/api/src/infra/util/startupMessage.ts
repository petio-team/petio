import pkg from '@/../package.json';
import { HasConfig } from '@/config/config';
import { config } from '@/config/schema';
import logger from '@/loaders/logger';

export default async () => {
  logger.info(`Petio v${pkg.version} [${config.get('logger.level')}]`);
  logger.info(
    `Listening on http://${config.get('petio.host')}:${config.get(
      'petio.port',
    )}`,
  );
  if (!(await HasConfig())) {
    logger.warn(
      'Initial setup is required, please proceed to the webui to begin the setup',
    );
  }
};
