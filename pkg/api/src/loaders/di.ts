import { container } from 'tsyringe';

import MediaServerDB from '@/models/mediaserver/db';
import { IMediaServerRepository } from '@/models/mediaserver/repository';

export default () => {
  container.register<IMediaServerRepository>('MediaServer', {
    useClass: MediaServerDB,
  });
};
