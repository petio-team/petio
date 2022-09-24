import { QualityProfile, RootPath, LanguageProfile, SeriesType, Tag, Queue, Series } from "./sonarr/types";
import { ArrVersion, parseVersion } from './version';
import ClientV3 from '@/infra/arr/sonarr/v3';
import ClientV4 from '@/infra/arr/sonarr/v4';
import { DownloaderType, GetDownloaderById } from '@/models/downloaders';

export default class SonarrAPI {
  /**
   * Instance of the v3 Sonarr Client
   */
  private ClientV3: ClientV3;

  /**
   * Instance of the v4 Sonarr Client
   */
  private ClientV4: ClientV4;

  /**
   * The current version of the client
   */
  private version = new ArrVersion(3, 0, 0, 0);

  constructor(url: URL, token: string, version?: string) {
    this.ClientV3 = new ClientV3(url, token);
    this.ClientV4 = new ClientV4(url, token);

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
    const response = await this.ClientV3.GetSystemStatus();
    if (response) {
      if (response.version !== "Sonarr") {
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
    return this.ClientV3.GetRootFolders();
  }

  public async GetQualityProfiles(): Promise<QualityProfile[]> {
    return this.ClientV3.GetQualityProfiles();
  }

  public async GetLanguages(): Promise<LanguageProfile[]> {
    switch(this.version.major) {
      case 4: {
        return this.ClientV4.GetLanguages();
      }
      default: {
        return this.ClientV3.GetLanguageProfile();
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
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

  public async GetTags(): Promise<Tag[]> {
    return this.ClientV3.GetTags();
  }

  public async GetQueue(page?: number): Promise<Queue> {
    switch(this.version.major) {
      case 4: {
        return this.ClientV4.GetQueue(page);
      }
      default: {
        return this.ClientV3.GetQueue(page);

      }
    }
  }

  public async GetSeriesById(id: number): Promise<Series> {
    return this.ClientV3.GetSeriesById(id);
  }

  public async GetSeriesLookupById(id: number): Promise<Series[]> {
    return this.ClientV3.GetSeriesLookupById(id);
  }

  public async UpdateSeriesById(id: number, data: Series) {
    return this.ClientV3.UpdateSeriesById(id, data);
  }

  public async CreateSeries(data: Series) {
    return this.ClientV3.CreateSeries(data);
  }

  public async DeleteSeries(id: number, deleteFiles?: boolean) {
    return this.ClientV3.DeleteSeries(id, deleteFiles);
  }

  public async Calendar(unmonitored?: boolean, start?: Date, end?: Date) {
    return this.ClientV3.GetCalendar(unmonitored, start, end);
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
