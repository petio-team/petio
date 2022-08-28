import { PlexAPI } from '@/infra/plex/plex';
import { injectable } from "tsyringe";
@injectable()
export class Plex {
  private plexapi: ReturnType<typeof PlexAPI>;

  constructor(
    url: URL,
    token: string,
  ) {
    this.plexapi = PlexAPI(url, token);
  }

  public async testConnection(): Promise<boolean> {
    try {
      const status = await this.plexapi.get('/');
      if (status) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
}
