import { removeSlashes } from './urls';
import { HasConfig } from '@/config/config';
import env from '@/config/env';
import { config } from '@/config/schema';
import logger from '@/loaders/logger';


export default async () => {
  const subpath = `/${  removeSlashes(config.get('petio.subpath'))}`;

  logger.info(`Petio v${env.app.version} [${config.get('logger.level')}]`);
  logger.info(
    `Serving webui on http://${config.get('petio.host')}:${config.get(
      'petio.port',
    )}${subpath}`,
  );
  if (!(await HasConfig())) {
    logger.warn(
      'Initial setup is required, please proceed to the webui to begin the setup',
    );
  }
};
