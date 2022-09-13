import { RadarrAPIClient } from '@/infra/arr/radarr/index';
import { Language } from '@/infra/arr/radarr/language';
import { MinimumAvailability } from '@/infra/arr/radarr/minimumAvailability';
import { Movie } from '@/infra/arr/radarr/movie';
import { QualityProfiles } from '@/infra/arr/radarr/quality_profile';
import { Queue } from '@/infra/arr/radarr/queue';
import { RootFolder } from '@/infra/arr/radarr/root_folder';
import { Tag } from '@/infra/arr/radarr/tag';
import { DownloaderType, GetDownloaderById } from '@/models/downloaders';

import { ArrVersion, parseVersion } from './version';

export default class RadarrAPI {
  private client: ReturnType<typeof RadarrAPIClient>;
  private version = new ArrVersion(4, 0, 0, 0);

  constructor(url: URL, token: string, version?: string) {
    this.client = RadarrAPIClient(url, token);
    if (version) {
      const v = parseVersion(version);
      if (v) {
        this.version = v;
      }
    }
  }

  public GetVersion(): ArrVersion {
    return this.version;
  }

  public async TestConnection(): Promise<boolean> {
    const response = await this.client.get('/api/v3/system/status');
    if (response) {
      const version = parseVersion(response.version);
      if (version) {
        this.version = version;
      }
      return true;
    }
    return false;
  }

  public async GetRootPaths(): Promise<RootFolder> {
    return this.client.get('/api/v3/rootfolder');
  }

  public async GetQualityProfiles(): Promise<QualityProfiles> {
    return this.client.get('/api/v3/qualityprofile');
  }

  public async GetLanguages(): Promise<Language> {
    return this.client.get('/api/v3/language');
  }

  public async GetTags(): Promise<Tag> {
    return this.client.get('/api/v3/tag');
  }

  public GetMinimumAvailability(): MinimumAvailability[] {
    return [
      {
        id: 0,
        name: 'Announced',
      },
      {
        id: 1,
        name: 'In Cinemas',
      },
      {
        id: 2,
        name: 'Released',
      },
    ];
  }

  public async GetQueue(page?: number): Promise<Queue> {
    return this.client.get('/api/v3/queue', {
      queries: {
        page,
      },
    });
  }

  public async GetMovie(id: number): Promise<Movie> {
    return this.client.get('/api/v3/movie/:id', {
      params: {
        id,
      },
    });
  }

  public async LookupMovie(id: number): Promise<Movie> {
    return this.client.get('/api/v3/movie/lookup', {
      queries: {
        term: 'tmdb:' + id,
      },
    });
  }

  public async CreateMovie(data: Movie): Promise<Movie> {
    return this.client.post('/api/v3/movie', data);
  }

  public async DeleteMovie(id: number): Promise<void> {
    this.client.delete('/api/v3/movie/:id', undefined, {
      params: {
        id,
      },
    });
  }

  public async Calendar(unmonitored?: boolean, start?: Date, end?: Date) {
    return this.client.get('/api/v3/calendar', {
      queries: {
        unmonitored,
        start,
        end,
      },
    });
  }
}

export const GetRadarrInstanceFromDb = async (
  id: string,
): Promise<RadarrAPI | undefined> => {
  try {
    const radarr = await GetDownloaderById(id);
    if (radarr.type !== DownloaderType.Radarr) {
      return undefined;
    }

    return new RadarrAPI(new URL(radarr.url), radarr.token);
  } catch (error) {
    return undefined;
  }
};
