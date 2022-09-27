import { LanguageProfile, Queue } from "../types";
import Client from './v4/client';

export default class SonarrAPIV4 {
  private client: ReturnType<typeof Client>;

  constructor(url: URL, token: string) {
    this.client = Client(url, token);
  }

  async GetLanguages(): Promise<LanguageProfile[]> {
    const results = await this.client.get("/api/v3/language");
    return results.map((r) => ({ id: r.id, name: r.name }));
  }

  async GetQueue(page?: number): Promise<Queue> {
    const results = await this.client.get("/api/v3/queue", {
      queries: {
        page,
      },
    });
    return {
      page: results.page,
      size: results.pageSize,
      total: results.totalRecords,
      items: results.records.map((i) => ({
        id: i.id,
        status: i.status,
      }))
     };
  }
}
