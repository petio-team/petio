import { ArrVersion, parseVersion } from './version';
import { SonarrAPIClient } from '@/infra/arr/sonarr/index';
import { LanguageProfile } from '@/infra/arr/sonarr/language_profile';
import { Queue } from '@/infra/arr/sonarr/queue';
import { Series, SeriesLookup } from '@/infra/arr/sonarr/series';
import { Tag } from '@/infra/arr/sonarr/tag';
import { DownloaderType, GetDownloaderById } from '@/models/downloaders';


export type SeriesType = {
  id: number;
  name: string;
};

export type RootPath = {
  id: number;
  path: string;
};

export type QualityProfile = {
  id: number;
  name: string;
};

export type SeriesLanguage = {
  id: number;
  name: string;
};

export default class SonarrAPI {
  private client: ReturnType<typeof SonarrAPIClient>;

  private version = new ArrVersion(3, 0, 0, 0);

  constructor(url: URL, token: string, version?: string) {
    this.client = SonarrAPIClient(url, token);
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
      if (response.appName !== "Sonarr") {
        return false;
      }
      const version = parseVersion(response.version);
      if (version) {
        this.version = version;
      }
      return true;
    }
    return false;
  }

  public async GetRootPaths(): Promise<RootPath[]> {
    const paths = await this.client.get('/api/v3/rootfolder');
    return paths.map((r) => ({ id: r.id, path: r.path }));
  }

  public async GetQualityProfiles(): Promise<QualityProfile[]> {
    const profiles = await this.client.get('/api/v3/qualityprofile');
    return profiles.map((r) => ({ id: r.id, name: r.name }));
  }

  public async GetLanguageProfile(): Promise<LanguageProfile> {
    return this.client.get('/api/v3/languageprofile');
  }

  public async GetLanguages(): Promise<SeriesLanguage[]> {
    if (this.version.major === 4) {
      const results = await this.client.get('/api/v3/language');
      return results.map((r) => ({ id: r.id, name: r.name }));
    }

    const results = await this.client.get('/api/v3/languageprofile');
    return results.map((r) => ({ id: r.id, name: r.name }));
  }

  public GetSeriesTypes(): SeriesType[] {
    return [
      {
        id: 0,
        name: 'Standard',
      },
      {
        id: 1,
        name: 'Daily',
      },
      {
        id: 2,
        name: 'Anime',
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
        term: `tvdb:${  id}`,
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
