/* eslint-disable no-await-in-loop */

/* eslint-disable no-restricted-syntax */
import { getFromContainer } from '@/infra/container/container';
import loggerMain from '@/infra/logger/logger';
import { SonarrV3Client } from '@/infra/servarr/sonarr';
import { DownloaderEntity } from '@/resources/downloader/entity';
import { DownloaderRepository } from '@/resources/downloader/repository';
import { DownloaderType } from '@/resources/downloader/types';
import { RequestRepository } from '@/resources/request/repository';

const logger = loggerMain.child({ module: 'downloaders.sonarr' });

export default class Sonarr {
  instance: DownloaderEntity;

  client: SonarrV3Client;

  constructor(instance: DownloaderEntity) {
    this.instance = instance;
    this.client = new SonarrV3Client({
      BASE: instance.url,
      HEADERS: {
        'x-api-key': instance.token,
      },
    });
  }

  public getClient(): SonarrV3Client {
    return this.client;
  }

  async queue() {
    const queue = {};
    const instances = await getFromContainer(DownloaderRepository).findAll({
      type: DownloaderType.SONARR,
    });
    for (const instance of instances) {
      const api = new SonarrV3Client({
        BASE: instance.url,
        HEADERS: {
          'x-api-key': instance.token,
        },
      });

      const active = await api.system.getApiV3SystemStatus();
      if (!active) {
        return false;
      }

      if (!instance.id) {
        // eslint-disable-next-line no-continue
        continue;
      }

      queue[instance.id] = await api.queue.getApiV3Queue();
      const { totalRecords } = queue[instance.id];
      const { pageSize } = queue[instance.id];
      const pages = Math.ceil(totalRecords / pageSize);
      // eslint-disable-next-line no-plusplus
      for (let p = 2; p <= pages; p++) {
        const queuePage = await api.queue.getApiV3Queue({
          page: p,
        });
        if (queuePage.records)
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

    const result = await this.client.seriesLookup.getApiV3SeriesLookup(
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
      filter && filter.profile
        ? filter.profile
        : this.instance.metadata.profile,
      10,
    );

    result.seasonFolder = true;
    result.rootFolderPath = `${
      filter && filter.path ? filter.path : this.instance.metadata.path
    }`;
    result.addOptions = {
      searchForMissingEpisodes: true,
    };
    result.languageProfileId = parseInt(
      filter && filter.language
        ? filter.language
        : this.instance.metadata.language,
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
        await this.client.series.putApiV3SeriesById({
          id: result.id,
          requestBody: result,
        });
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
        const add = await this.client.series.postApiV3Series({
          requestBody: result,
        });
        if (!add.added) {
          logger.error(
            `failed to add series (${result.id}) to sonarr instance (${this.instance.name})`,
          );
        }
        logger.debug(
          `SERVICE - SONARR: [${this.instance.name}] Sonnar job added for ${request.title}`,
        );
        if (add.id) {
          sonarrId = add.id;
        }
      } catch (err) {
        logger.error(
          `SERVICE - SONARR: [${this.instance.name}] Unable to add series`,
          err,
        );
        return;
      }
    }
    try {
      const requestResult = await getFromContainer(RequestRepository).findOne({
        requestId: request.id,
      });
      if (requestResult.isNone()) {
        logger.debug(
          `SERVICE - SONARR: [${this.instance.name}] No request found with id ${request.id}`,
        );
        return;
      }
      const dbRequest = requestResult.unwrap();

      let exists = false;
      // eslint-disable-next-line no-plusplus
      for (let o; o < dbRequest.sonarrs.length; o++) {
        if (dbRequest.sonarrs[o][this.instance.id]) {
          exists = true;
          dbRequest.sonarrs[o][this.instance.id] = sonarrId;
        }
      }
      if (!exists) {
        dbRequest.sonarrs.push(`${sonarrId}`);
        await getFromContainer(RequestRepository).updateMany(
          { requestId: request.id },
          { $set: { sonarrs: dbRequest.sonarrs } },
        );
      }
    } catch (err) {
      logger.error(`SERVICE - SONARR: Can't update request in Db`, err);
    }
  }

  async remove(id: number) {
    try {
      await this.client.series.deleteApiV3SeriesById({
        id,
      });
      return true;
    } catch (err) {
      logger.error('SONARR: Unable to remove job, likely already removed', err);
    }
    return false;
  }
}
