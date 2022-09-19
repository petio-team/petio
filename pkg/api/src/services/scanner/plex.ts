import { IMediaScanner } from './index';
import { PlexAPI } from '@/infra/plex/plex';
import MediaServerDB from '@/models/mediaserver/db';


export class PlexMediaScanner implements IMediaScanner {
  private plexapi: ReturnType<typeof PlexAPI>;

  private model: typeof MediaServerDB;

  constructor(url: URL, token: string) {
    this.plexapi = PlexAPI(url, token);
    this.model = MediaServerDB;
  }

  public async GetLibrary(): Promise<void> {}

  public async GetMetadata(): Promise<void> {}

  public async GetUsers(): Promise<void> {}

  public async GetRecentlyAdded(): Promise<void> {}

  public async GetRecentlyWatched(): Promise<void> {}
}
