import { IRead, IWrite } from '../base';
import { MediaServer, MediaServerType } from './dto';

export interface IMediaServerRepository
  extends IWrite<MediaServer>,
    IRead<MediaServer> {
  GetByType(type: MediaServerType): Promise<MediaServer[]>;
  CreateOrUpdate(mediaserver: MediaServer): Promise<MediaServer>;
  RestoreById(id: string): Promise<MediaServer>;
}
