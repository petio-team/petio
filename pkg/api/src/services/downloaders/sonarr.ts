import SonarrAPI from '@/infra/arr/sonarr';
import { Series } from '@/infra/arr/sonarr/series';
import logger from '@/loaders/logger';
import {
  DownloaderType,
  GetAllDownloaders,
  IDownloader,
} from '@/models/downloaders';
import Request from '@/models/request';

export default class Sonarr {
  instance: IDownloader;

  client: SonarrAPI;

  constructor(instance: IDownloader) {
    this.instance = instance;

    const url = new URL(instance.url);
    this.client = new SonarrAPI(url, instance.token);
  }

  public getClient(): SonarrAPI {
    return this.client;
  }

  async queue() {
    const queue = {};
    const instances = await GetAllDownloaders(DownloaderType.Sonarr);
    for (const instance of instances) {
      const url = new URL(instance.url);
      const api = new SonarrAPI(url, instance.token);

      const active = await api.TestConnection();
      if (!active) {
        return false;
      }

      if (!instance.id) {
        continue;
      }

      queue[instance.id] = await api.GetQueue();
      const {totalRecords} = queue[instance.id];
      const {pageSize} = queue[instance.id];
      const pages = Math.ceil(totalRecords / pageSize);
      for (let p = 2; p <= pages; p++) {
        const queuePage = await api.GetQueue(p);
        queue[instance.id].records = [
          ...queue[instance.id].records,
          ...queuePage.records,
        ];
      }
      queue[instance.id].serverName = instance.name;
    }
    return queue;
  }

  async addShow(request, filter: any = false) {
    let sonarrId = -1;
    if (!request.tvdb_id) {
      logger.verbose(
        `SERVICE - SONARR: TVDB ID not found for ${request.title}`,
        { label: 'downloaders.sonarr' },
      );
      return;
    }

    if (!this.instance.id) {
      return;
    }

    const result: Series = await this.client.GetSeriesLookupById(
      request.tvdb_id,
    )[0];
    const rSeasons = request.seasons;
    if (rSeasons) {
      for (const season of result.seasons) {
        if (season) {
          season.monitored = !!rSeasons[season.seasonNumber];
        }
      }
    }

    result.qualityProfileId = parseInt(
      filter && filter.profile ? filter.profile : this.instance.profile.id,
    );

    result.seasonFolder = true;
    result.rootFolderPath = `${
      filter && filter.path ? filter.path : this.instance.path.location
    }`;
    result.addOptions = {
      searchForMissingEpisodes: true,
    };
    result.languageProfileId = parseInt(
      filter && filter.language ? filter.language : this.instance.language.id,
    );
    if (filter && filter.type) result.seriesType = filter.type;
    if (filter && filter.tag) result.tags = [parseInt(filter.tag)];

    if (result.id) {
      sonarrId = result.id;
      logger.verbose(
        `SERVICE - SONARR: Request exists - Updating ${request.title}`,
        { label: 'downloaders.sonarr' },
      );
      try {
        await this.client.UpdateSeriesById(result.id, result);
        logger.verbose(
          `SERVICE - SONARR: [${this.instance.name}] Sonnar job updated for ${request.title}`,
          { label: 'downloaders.sonarr' },
        );
      } catch (err) {
        logger.error(
          `SERVICE - SONARR: [${this.instance.name}] Unable to update series`,
          { label: 'downloaders.sonarr' },
        );
        logger.error(err, { label: 'downloaders.sonarr' });
        return false;
      }
    } else {
      try {
        const add = await this.client.CreateSeries(result);
        if (!add.added) {
          logger.error(
            `failed to add series (${result.id}) to sonarr instance (${this.instance.name})`,
          );
        }

        logger.verbose(
          `SERVICE - SONARR: [${this.instance.name}] Sonnar job added for ${request.title}`,
          { label: 'downloaders.sonarr' },
        );
        sonarrId = add.id;
      } catch (err) {
        logger.error(
          `SERVICE - SONARR: [${this.instance.name}] Unable to add series`,
          { label: 'downloaders.sonarr' },
        );
        logger.error(err, { label: 'downloaders.sonarr' });
        return false;
      }
    }
    try {
      const dbRequest = await Request.findOne({
        requestId: request.id,
      }).exec();
      if (!dbRequest) {
        logger.verbose(
          `SERVICE - SONARR: [${this.instance.name}] No request found with id ${request.id}`,
          { label: 'downloaders.sonarr' },
        );
        return;
      }

      let exists = false;
      for (let o; o < dbRequest.sonarrId.length; o++) {
        if (dbRequest.sonarrId[o][this.instance.id]) {
          exists = true;
          dbRequest.sonarrId[o][this.instance.id] = sonarrId;
        }
      }
      if (!exists)
        dbRequest.sonarrId.push({
          [this.instance.id]: sonarrId,
        });
      await dbRequest.save();
    } catch (err) {
      logger.error(err.stack, { label: 'downloaders.sonarr' });
      logger.error(`SERVICE - SONARR: Can't update request in Db`, {
        label: 'downloaders.sonarr',
      });
      logger.error(err, { label: 'downloaders.sonarr' });
    }
  }

  async remove(id) {
    const active = await this.client.TestConnection();
    if (!active) {
      return false;
    }
    try {
      return await this.client.DeleteSeries(id);
    } catch {
      logger.warn('SONARR: Unable to remove job, likely already removed', {
        label: 'downloaders.sonarr',
      });
    }
  }
}
