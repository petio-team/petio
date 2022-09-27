import { RootPath, Status, QualityProfile, LanguageProfile, Tag, Series, Queue, Calendar } from "../types";
import Client from './v3/client';
import { SeriesSchema } from "./v3/series";

export default class SonarrAPIV3 {
  private client: ReturnType<typeof Client>;

  constructor(url: URL, token: string) {
    this.client = Client(url, token);
  }

  async GetSystemStatus(): Promise<Status> {
    const result = await this.client.get("/api/v3/system/status");
    return {
      name: result.appName,
      version: result.version,
    }
  }

  public async GetRootFolders(): Promise<RootPath[]> {
    const results = await this.client.get('/api/v3/rootfolder');
    return results.map((r) => ({ id: r.id, path: r.path }));
  }

  public async GetQualityProfiles(): Promise<QualityProfile[]> {
    const results = await this.client.get('/api/v3/qualityprofile');
    return results.map((r) => ({ id: r.id, name: r.name }));
  }

  public async GetLanguageProfile(): Promise<LanguageProfile[]> {
    const results = await this.client.get('/api/v3/languageprofile');
    return results.map((r) => ({ id: r.id, name: r.name }));
  }

  public async GetTags(): Promise<Tag[]> {
    const results = await this.client.get('/api/v3/tag');
    return results.map((r) => ({ id: r.id, name: r.label }));
  }

  public async GetSeriesById(id: number): Promise<Series> {
    const result = await this.client.get('/api/v3/series/:id', { params: { id } });
    return {
      id: result.id,
      title: result.title,
      status: result.status,
      airTime: result.airTime,
    }
  }

  public async GetSeriesLookupById(id: number): Promise<Series[]> {
    const results = await this.client.get('/api/v3/series/lookup', {
      queries: {
        term: `tvdb:${id}`,
      },
    });
    return results.map((r) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      airTime: r.airTime,
    }));
  }

  public async UpdateSeriesById(id: number, data: Series) {
    return this.client.put('/api/v3/series/:id', data, {
      params: {
        id,
      },
    });
  }

  public async CreateSeries(data: Series) {
    const series = SeriesSchema.parse({
      id: data.id,
      title: data.title,
      status: data.status,
      airTime: data.airTime,
    });

    this.client.post('/api/v3/series', series);
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

  public async GetQueue(page?: number): Promise<Queue> {
    const results = await this.client.get('/api/v3/queue', {
      queries: {
        page,
      },
    });
    return {
      page: results.page,
      size: results.pageSize,
      total: results.totalRecords,
      items: results.records.map((r) => ({
        id: r.id,
        status: r.status,
      })),
    }
  }

  async GetCalendar(
    unmonitored?: boolean,
    start?: Date,
    end?: Date,
  ): Promise<Calendar[]> {
    const results = await this.client.get('/api/v3/calendar', {
      queries: {
        unmonitored,
        start,
        end,
      },
    });
    return results.map((r) => ({
      id: r.id,
      title: r.title,
      airDate: r.airDateUtc,
      show: {
        seasonNumber: r.seasonNumber,
        episodeNumber: r.episodeNumber,
        tvdbid: r.tvdbId,
      }
    }));
  }
}
