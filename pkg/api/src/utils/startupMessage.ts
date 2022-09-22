import { removeSlashes } from './urls';
import appConfig from "@/config/env/app";
import config from '@/config/schema';
import logger from '@/loaders/logger';

export default () => {
  const subpath = `/${  removeSlashes(config.get('petio.subpath'))}`;
  logger.info(`Petio v${appConfig.version} [${config.get('logger.level')}]`);
  logger.info(
    `Serving Web UI on http://${config.get('petio.host')}:${config.get(
      'petio.port',
    )}${subpath}`,
  );
};
