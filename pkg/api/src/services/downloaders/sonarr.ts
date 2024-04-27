/* eslint-disable no-restricted-syntax */
import SonarrAPI from '@/infra/arr/sonarr';
import { Series } from '@/infra/arr/sonarr/series';
import loggerMain from '@/loaders/logger';
import {
  DownloaderType,
  GetAllDownloaders,
  IDownloader,
} from '@/models/downloaders';
import Request from '@/models/request';

const logger = loggerMain.child({ label: 'downloaders.sonarr' });

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
      const { totalRecords } = queue[instance.id];
      const { pageSize } = queue[instance.id];
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
      logger.debug(`SERVICE - SONARR: TVDB ID not found for ${request.title}`);
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
      10,
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
      10,
    );
    if (filter && filter.type) result.seriesType = filter.type;
    if (filter && filter.tag) result.tags = [parseInt(filter.tag, 10)];

    if (result.id) {
      sonarrId = result.id;
      logger.debug(
        `SERVICE - SONARR: Request exists - Updating ${request.title}`,
      );
      try {
        await this.client.UpdateSeriesById(result.id, result);
        logger.debug(
          `SERVICE - SONARR: [${this.instance.name}] Sonnar job updated for ${request.title}`,
        );
      } catch (err) {
        logger.error(
          `SERVICE - SONARR: [${this.instance.name}] Unable to update series`,
          err,
        );
        return;
      }
    } else {
      try {
        const add = await this.client.CreateSeries(result);
        if (!add.added) {
          logger.error(
            `failed to add series (${result.id}) to sonarr instance (${this.instance.name})`,
          );
        }
        logger.debug(
          `SERVICE - SONARR: [${this.instance.name}] Sonnar job added for ${request.title}`,
        );
        sonarrId = add.id;
      } catch (err) {
        logger.error(
          `SERVICE - SONARR: [${this.instance.name}] Unable to add series`,
          err,
        );
        return;
      }
    }
    try {
      const dbRequest = await Request.findOne({
        requestId: request.id,
      }).exec();
      if (!dbRequest) {
        logger.debug(
          `SERVICE - SONARR: [${this.instance.name}] No request found with id ${request.id}`,
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
      logger.error(`SERVICE - SONARR: Can't update request in Db`, err);
    }
  }

  async remove(id: number) {
    try {
      await this.client.DeleteSeries(id);
      return true;
    } catch (err) {
      logger.error('SONARR: Unable to remove job, likely already removed', err);
    }
    return false;
  }
}
