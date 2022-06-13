import { container } from 'tsyringe';
import { Logger } from 'winston';

import logger from '@/loaders/logger';
import MediaServerDB from '@/models/mediaserver/db';
import { IMediaServerRepository } from '@/models/mediaserver/repository';

export default () => {
  container.register<Logger>('Logger', { useValue: logger });
  container.register<IMediaServerRepository>('MediaServer', {
    useClass: MediaServerDB,
  });
};
