import { SonarrAPIClient } from '@/infra/arr/sonarr/index';
import { LanguageProfile } from '@/infra/arr/sonarr/language_profile';
import { QualityProfile } from '@/infra/arr/sonarr/quality_profile';
import { Queue } from '@/infra/arr/sonarr/queue';
import { RootFolder } from '@/infra/arr/sonarr/root_folder';
import { Series, SeriesLookup } from '@/infra/arr/sonarr/series';
import { Tag } from '@/infra/arr/sonarr/tag';
import { DownloaderType, GetDownloaderById } from '@/models/downloaders';

export type SeriesType = {
  status: string;
};

export default class SonarrAPI {
  private client: ReturnType<typeof SonarrAPIClient>;

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

  public GetSeriesTypes(): SeriesType[] {
    return [
      {
        status: 'Standard',
      },
      {
        status: 'Daily',
      },
      {
        status: 'Anime',
      },
    ];
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

  public async GetSeriesById(id: number): Promise<Series> {
    return this.client.get('/api/v3/series/:id', { params: { id } });
  }

  public async GetSeriesLookupById(id: number): Promise<SeriesLookup> {
    return this.client.get('/api/v3/series/lookup', {
      queries: {
        term: 'tvdb:' + id,
      },
    });
  }

  public async UpdateSeriesById(id: number, data: Series) {
    return this.client.put('/api/v3/series/:id', data, {
      params: {
        id,
      },
    });
  }

  public async CreateSeries(data: Series) {
    return this.client.post('/api/v3/series', data);
  }

  public async DeleteSeries(id: number, deleteFiles?: boolean) {
    return this.client.delete('/api/v3/series/:id', undefined, {
      params: {
        id,
      },
      queries: {
        deleteFiles,
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
