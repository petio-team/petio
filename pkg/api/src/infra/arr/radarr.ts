import { Availability, Calendar, Media, Queue, Tag } from "./types";
import { ArrVersion, parseVersion } from './version';
import ClientV4 from '@/infra/arr/radarr/v4';
import { DownloaderType, GetDownloaderById } from '@/models/downloaders';


export type RootPath = {
  id: number;
  path: string;
};

export type QualityProfile = {
  id: number;
  name: string;
};

export type LanguageProfile = {
  id: number;
  name: string;
};

export default class RadarrAPI {
  private ClientV4: ClientV4;

  private version = new ArrVersion(4, 0, 0, 0);

  constructor(url: URL, token: string, version?: string) {
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
    const response = await this.ClientV4.GetSystemStatus();
    if (response) {
      if (response.name !== "Radarr") {
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
    return this.ClientV4.GetRootPaths();
  }

  public async GetQualityProfiles(): Promise<QualityProfile[]> {
    return this.ClientV4.GetQualityProfiles();
  }

  public async GetLanguages(): Promise<LanguageProfile[]> {
    return this.ClientV4.GetLanguages();
  }

  public async GetTags(): Promise<Tag[]> {
    return this.ClientV4.GetTags();
  }

  // eslint-disable-next-line class-methods-use-this
  public GetMinimumAvailability(): Availability[] {
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
    return this.ClientV4.GetQueue(page);
  }

  public async GetMovie(id: number): Promise<Media> {
    return this.ClientV4.GetMovie(id);
  }

  public async LookupMovie(id: number): Promise<Media> {
    return this.ClientV4.LookupMovie(id);
  }

  public async CreateMovie(media: Media) {
    this.ClientV4.CreateMovie(media);
  }

  public async DeleteMovie(id: number): Promise<void> {
    this.ClientV4.DeleteMovie(id);
  }

  public async Calendar(unmonitored?: boolean, start?: Date, end?: Date): Promise<Calendar> {
    return this.ClientV4.Calendar(unmonitored, start, end);
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
