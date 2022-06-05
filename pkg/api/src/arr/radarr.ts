import { ZodiosInstance } from '@zodios/core';

import { RadarrAPIClient, RadarrAPIEndpoints } from '@/arr/radarr/index';
import { DownloaderType, GetDownloaderById } from '@/models/downloaders';

import { Language } from './radarr/language';
import { Movie } from './radarr/movie';
import { QualityProfile } from './radarr/quality_profile';
import { Queue } from './radarr/queue';
import { RootFolder } from './radarr/root_folder';
import { Tag } from './radarr/tag';

export default class RadarrAPI {
  private client: ZodiosInstance<typeof RadarrAPIEndpoints>;

  constructor(url: URL, token: string) {
    this.client = RadarrAPIClient(url, token);
  }

  public async TestConnection(): Promise<boolean> {
    const response = await this.client.get('/api/v3/system/status');
    if (response) {
      return true;
    }

    return false;
  }

  public async GetRootPaths(): Promise<RootFolder> {
    return this.client.get('/api/v3/rootfolder');
  }

  public async GetQualityProfiles(): Promise<QualityProfile> {
    return this.client.get('/api/v3/qualityprofile');
  }

  public async GetLanguages(): Promise<Language> {
    return this.client.get('/api/v3/language');
  }

  public async GetTags(): Promise<Tag> {
    return this.client.get('/api/v3/tag');
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