import { Availability, Calendar, LanguageProfile, Media, MediaType, QualityProfile, Queue, RootPath, Status, Tag } from "../types";
import Client from "./v4/client";
import { MovieSchema } from "./v4/movie";

export default class RadarrAPIV4 {
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

  public async GetRootPaths(): Promise<RootPath[]> {
    const paths = await this.client.get('/api/v3/rootfolder');
    return paths.map((r) => ({ id: r.id, path: r.path }));
  }

  public async GetQualityProfiles(): Promise<QualityProfile[]> {
    const profiles = await this.client.get('/api/v3/qualityprofile');
    return profiles.map((r) => ({ id: r.id, name: r.name }));
  }

  public async GetLanguages(): Promise<LanguageProfile[]> {
    const language = await this.client.get('/api/v3/language');
    return language.map((r) => ({ id: r.id, name: r.name }));
  }

  public async GetTags(): Promise<Tag[]> {
    const tags = await this.client.get('/api/v3/tag');
    return tags.map((t) => ({ id: t.id, name: t.label }));
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
    const queue = await this.client.get('/api/v3/queue', {
      queries: {
        page,
      },
    });
    return {
      page: queue.page,
      size: queue.pageSize,
      total: queue.totalRecords,
      items: queue.records.map((i) => ({
        id: i.id,
        status: i.status,
      }))
    };
  }

  public async GetMovie(id: number): Promise<Media> {
    const movie = await this.client.get('/api/v3/movie/:id', {
      params: {
        id,
      },
    });
    return {
      id: movie.id,
      title: movie.title,
      status: movie.status,
      airTime: movie.digitalRelease,
      type: MediaType.Movie,
    }
  }

  public async LookupMovie(id: number): Promise<Media> {
    const lookup = await this.client.get('/api/v3/movie/lookup', {
      queries: {
        term: `tmdb:${  id}`,
      },
    });
    return {
      id: lookup.id,
      title: lookup.title,
      status: lookup.status,
      airTime: lookup.digitalRelease,
      type: MediaType.Movie,
    }
  }

  public async CreateMovie(data: Media) {
    const media = MovieSchema.parse({
      id: data.id,
      title: data.title,
      status: data.status,
      digitalRelease: data.airTime,
    });
    await this.client.post('/api/v3/movie', media);
  }

  public async DeleteMovie(id: number): Promise<void> {
    await this.client.delete('/api/v3/movie/:id', undefined, {
      params: {
        id,
      },
    });
  }

  public async Calendar(unmonitored?: boolean, start?: Date, end?: Date): Promise<Calendar[]> {
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
      airDate: r.digitalRelease ? r.digitalRelease! : r.physicalRelease!,
      movie: {
        tmdbid: r.tmdbId,
      }
    }));
  }
}
