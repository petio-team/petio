import { ZodiosInstance } from '@zodios/core';

import { SonarrAPIClient, SonarrAPIEndpoints } from '@/arr/sonarr/index';
import { DownloaderType, GetDownloaderById } from '@/models/downloaders';

import { LanguageProfile } from './sonarr/language_profile';
import { QualityProfile } from './sonarr/quality_profile';
import { RootFolder } from './sonarr/root_folder';
import { SeriesId } from './sonarr/series_id';
import { SeriesLookup } from './sonarr/series_lookup';
import { Tag } from './sonarr/tag';

export default class SonarrAPI {
  private client: ZodiosInstance<typeof SonarrAPIEndpoints>;

  constructor(url: URL, token: string) {
    this.client = SonarrAPIClient(url, token);
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

  public async GetLanguageProfile(): Promise<LanguageProfile> {
    return this.client.get('/api/v3/languageprofile');
  }

  public async GetTags(): Promise<Tag> {
    return this.client.get('/api/v3/tag');
  }

  public async GetSeriesById(id: number): Promise<SeriesId> {
    return this.client.get('/api/v3/series/:id', { params: { id } });
  }

  public async GetSeriesLookupById(id: number): Promise<SeriesLookup> {
    return this.client.get('/api/v3/series/lookup', {
      queries: {
        term: 'tvdb:' + id,
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

export const GetSonarrInstanceFromDb = async (
  id: string,
): Promise<SonarrAPI | undefined> => {
  try {
    const sonarr = await GetDownloaderById(id);
    if (sonarr.type !== DownloaderType.Sonarr) {
      return undefined;
    }

    return new SonarrAPI(new URL(sonarr.url), sonarr.token);
  } catch (error) {
    return undefined;
  }
};
