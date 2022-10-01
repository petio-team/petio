import { ZodiosInstance } from '@zodios/core';

import { Album, Albums } from '@/infra/arr/lidarr/album';
import { LidarrAPIClient, LidarrAPIEndpoints } from '@/infra/arr/lidarr/index';
import { Language } from '@/infra/arr/lidarr/language';
import { QualityProfiles } from '@/infra/arr/lidarr/quality_profile';
import { Queue } from '@/infra/arr/lidarr/queue';
import { RootFolder } from '@/infra/arr/lidarr/root_folder';
import { Tag } from '@/infra/arr/lidarr/tag';
import { DownloaderType, GetDownloaderById } from '@/models/downloaders';

import { Artist, Artists } from './lidarr/artist';

export default class LidarrAPI {
  private client: ZodiosInstance<typeof LidarrAPIEndpoints>;

  constructor(url: URL, token: string) {
    this.client = LidarrAPIClient(url, token);
  }

  public async TestConnection(): Promise<boolean> {
    const response = await this.client.get('/api/v1/system/status');
    if (response) {
      return true;
    }

    return false;
  }

  public async GetRootPaths(): Promise<RootFolder> {
    return this.client.get('/api/v1/rootfolder');
  }

  public async GetQualityProfiles(): Promise<QualityProfiles> {
    return this.client.get('/api/v1/qualityprofile');
  }

  public async GetLanguages(): Promise<Language> {
    return this.client.get('/api/v1/language');
  }

  public async GetTags(): Promise<Tag> {
    return this.client.get('/api/v1/tag');
  }

  public async GetQueue(page?: number): Promise<Queue> {
    return this.client.get('/api/v1/queue', {
      queries: {
        page,
      },
    });
  }

  public async GetAlbum(id: number): Promise<Album> {
    return this.client.get('/api/v1/album/:id', {
      params: {
        id,
      },
    });
  }

  public async LookupAlbum(term: string): Promise<Albums> {
    return this.client.get('/api/v1/album/lookup', {
      queries: {
        term: term,
      },
    });
  }

  public async CreateAlbum(data: Album): Promise<Album> {
    return this.client.post('/api/v1/album', data);
  }

  public async DeleteAlbum(id: number): Promise<void> {
    this.client.delete('/api/v1/album/:id', undefined, {
      params: {
        id,
      },
    });
  }

  public async LookupArtist(term: string): Promise<Artists> {
    return this.client.get('/api/v1/artist/lookup', {
      queries: {
        term: term,
      },
    });
  }

  public async GetArtist(id: number): Promise<Artist> {
    return this.client.get('/api/v1/artist/:id', {
      params: {
        id,
      },
    });
  }

  public async CreateArtist(data: Artist): Promise<Artist> {
    return this.client.post('/api/v1/artist', data);
  }

  public async DeleteArtist(id: number): Promise<void> {
    this.client.delete('/api/v1/artist/:id', undefined, {
      params: {
        id,
      },
    });
  }

  public async Calendar(unmonitored?: boolean, start?: Date, end?: Date) {
    return this.client.get('/api/v1/calendar', {
      queries: {
        unmonitored,
        start,
        end,
      },
    });
  }
}

export const GetLidarrInstanceFromDb = async (
  id: string,
): Promise<LidarrAPI | undefined> => {
  try {
    const lidarr = await GetDownloaderById(id);
    if (lidarr.type !== DownloaderType.Lidarr) {
      return undefined;
    }

    return new LidarrAPI(new URL(lidarr.url), lidarr.token);
  } catch (error) {
    return undefined;
  }
};
