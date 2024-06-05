/* eslint-disable no-restricted-syntax */
import {
  ArrRadarrAPIClient,
  MovieResource,
} from '@/infrastructure/arr/radarr-api';
import { getFromContainer } from '@/infrastructure/container/container';
import loggerMain from '@/infrastructure/logger/logger';
import is from '@/infrastructure/utils/is';
import { DownloaderEntity } from '@/resources/downloader/entity';
import { DownloaderRepository } from '@/resources/downloader/repository';
import { DownloaderType } from '@/resources/downloader/types';
import { RequestRepository } from '@/resources/request/repository';

const logger = loggerMain.child({ module: 'downloaders.radarr' });

export default class Radarr {
  instance: DownloaderEntity;

  client: ArrRadarrAPIClient;

  constructor(instance: DownloaderEntity) {
    this.instance = instance;
    this.client = new ArrRadarrAPIClient({
      BASE: instance.url,
      HEADERS: {
        'x-api-key': instance.token,
      },
    });
  }

  public getClient(): ArrRadarrAPIClient {
    return this.client;
  }

  async queue(): Promise<Object> {
    if (!this.instance.id) {
      return {};
    }

    const queue = {};
    queue[this.instance.id] = await this.client.queue.getApiV3Queue();
    const { totalRecords } = queue[this.instance.id];
    const { pageSize } = queue[this.instance.id];
    const pages = Math.ceil(totalRecords / pageSize);
    // eslint-disable-next-line no-plusplus
    for (let p = 2; p <= pages; p++) {
      // eslint-disable-next-line no-await-in-loop
      const queuePage = await this.client.queue.getApiV3Queue({
        page: p,
      });
      if (is.truthy(queuePage.records) && queuePage.records.length !== 0) {
        queue[this.instance.id].records = [
          ...queue[this.instance.id].records,
          ...queuePage.records,
        ];
      }
    }
    queue[this.instance.id].serverName = this.instance.name;
    return queue;
  }

  async add(movie: MovieResource, path = '', profile = -1, tag = '') {
    const movieData = movie;
    movieData.qualityProfileId =
      profile !== -1 ? profile : (this.instance.metadata.profile as number);
    movieData.rootFolderPath = `${
      path !== '' ? path : (this.instance.metadata.path as string)
    }`;
    movieData.addOptions = {
      searchForMovie: true,
    };
    movieData.monitored = true;
    if (tag) movieData.tags = [parseInt(tag, 10)];

    try {
      const add = await this.client.movie.postApiV3Movie({
        requestBody: movieData,
      });

      if (Array.isArray(add)) {
        if (add[1].errorMessage) throw add[1].errorMessage;
      }
      return add.id;
    } catch (err) {
      logger.error(
        `SERVICE - RADARR: [${this.instance.name}] Unable to add movie`,
        err,
      );
      throw err;
    }
  }

  async processJobs(jobQ, allInstances = false) {
    for (const job of jobQ) {
      // Target server
      if (allInstances) {
        try {
          const radarrData =
            (await this.client.movieLookup.getApiV3MovieLookupTmdb(
              job.tmdb_id,
            )) as any;
          let radarrId = -1;
          if (radarrData[0].id) {
            logger.debug(
              `SERVICE - RADARR: [${this.instance.name}] Job skipped already found for ${job.title}`,
            );
            radarrId = radarrData[0].id;
          } else {
            const id = await this.add(radarrData[0]);
            if (id) {
              radarrId = id;
              logger.debug(
                `SERVICE - RADARR: [${this.instance.name}] Radarr job added for ${job.title}`,
              );
            }
          }
          if (!this.instance.id) {
            return;
          }
          await getFromContainer(RequestRepository).updateMany(
            {
              requestId: job.requestId,
            },
            { $push: { radarrId: { [this.instance.id]: radarrId } } },
          );
        } catch (err) {
          logger.error(
            `SERVICE - RADARR: [${this.instance.name}] Unable to add movie ${job.title}`,
            err,
          );
        }
      } else {
        // Loop for all servers default
        const instances = await getFromContainer(DownloaderRepository).findAll({
          type: DownloaderType.RADARR,
        });
        // eslint-disable-next-line no-restricted-syntax
        for (const instance of instances) {
          if (!instance.enabled) {
            logger.debug(
              `SERVICE - RADARR: [${instance.name}] Server not active`,
            );
            return;
          }

          try {
            const api = new ArrRadarrAPIClient({
              BASE: instance.url,
              HEADERS: {
                'x-api-key': instance.token,
              },
            });

            const radarrData = (await api.movieLookup.getApiV3MovieLookupTmdb(
              job.tmdb_id,
            )) as any;
            let radarrId = -1;
            if (radarrData[0].id) {
              logger.debug(
                `SERVICE - RADARR: [${instance.name}] Job skipped already found for ${job.title}`,
              );
              radarrId = radarrData[0].id;
            } else {
              const id = await this.add(radarrData[0]);
              if (id) {
                radarrId = id;
                logger.debug(
                  `SERVICE - RADARR: [${instance.name}] Radarr job added for ${job.title}`,
                );
              }
            }
            if (!instance.id) {
              continue;
            }

            await getFromContainer(RequestRepository).updateMany(
              {
                requestId: job.requestId,
              },
              { $push: { radarrId: { [instance.id]: radarrId } } },
            );
          } catch (err) {
            logger.error(
              `SERVICE - RADARR: [${this.instance.name}] Unable to add movie ${job.title}`,
            );
          }
        }
      }
    }
  }

  async manualAdd(job, manual) {
    try {
      const radarrData = (await this.client.movieLookup.getApiV3MovieLookupTmdb(
        job.id,
      )) as any;
      let radarrId = -1;
      if (radarrData[0] && radarrData[0].id) {
        logger.debug(
          `SERVICE - RADARR: [${this.instance.name}] Job skipped already found for ${job.title}`,
        );
        radarrId = radarrData[0].id;
      } else {
        const id = await this.add(
          radarrData[0],
          manual.path,
          manual.profile,
          manual.tag,
        );
        if (id) {
          radarrId = id;
          logger.debug(
            `SERVICE - RADARR: [${this.instance.name}] Radarr job added for ${job.title}`,
          );
        }
      }
      if (!this.instance.id) {
        return;
      }
      await getFromContainer(RequestRepository).updateMany(
        {
          requestId: job.id,
        },
        { $push: { radarrId: { [this.instance.id]: radarrId } } },
      );
    } catch (err) {
      logger.error(
        `SERVICE - RADARR: [${this.instance.name}] Unable to add movie ${job.title}`,
        err,
      );
    }
  }

  async processRequest(id) {
    logger.debug(`SERVICE - RADARR: Processing request`);
    const requestResult = await getFromContainer(RequestRepository).findOne({
      requestId: id,
    });
    if (requestResult.isNone()) {
      logger.debug(`SERVICE - RADARR: no request found`);
      return;
    }
    const req = requestResult.unwrap();

    if (req.type === 'movie') {
      if (!req.tmdbId) {
        logger.debug(`SERVICE - RADARR: TMDB ID not found for ${req.title}`);
      } else if (req.radarrs.length === 0) {
        if (!req.approved) {
          logger.debug(
            `SERVICE - RADARR: Request requires approval - ${req.title}`,
          );
        } else {
          logger.debug('SERVICE - RADARR: Request passed to queue');
          this.processJobs([req]);
        }
      }
    }
  }
}
