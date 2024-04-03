import RadarrAPI from '@/infra/arr/radarr';
import { Movie } from '@/infra/arr/radarr/movie';
import logger from '@/loaders/logger';
import {
  DownloaderType,
  GetAllDownloaders,
  IDownloader,
} from '@/models/downloaders';
import Request from '@/models/request';

export default class Radarr {
  instance: IDownloader;

  client: RadarrAPI;

  constructor(instance: IDownloader) {
    this.instance = instance;

    const url = new URL(instance.url);
    this.client = new RadarrAPI(url, instance.token);
  }

  public getClient(): RadarrAPI {
    return this.client;
  }

  async queue() {
    if (!this.instance.id) {
      return;
    }

    const queue = {};
    queue[this.instance.id] = await this.client.GetQueue();
    const { totalRecords } = queue[this.instance.id];
    const { pageSize } = queue[this.instance.id];
    const pages = Math.ceil(totalRecords / pageSize);
    for (let p = 2; p <= pages; p++) {
      const queuePage = await this.client.GetQueue(p);
      queue[this.instance.id].records = [
        ...queue[this.instance.id].records,
        ...queuePage.records,
      ];
    }
    queue[this.instance.id].serverName = this.instance.name;
    return queue;
  }

  async add(
    movieData: Movie,
    path = '',
    profile = -1,
    tag = '',
  ) {
    movieData.qualityProfileId =
      profile !== -1 ? profile : this.instance.profile.id;
    movieData.rootFolderPath = `${path !== '' ? path : this.instance.path.location
      }`;
    movieData.addOptions = {
      searchForMovie: true,
    };
    movieData.monitored = true;
    if (tag) movieData.tags = [parseInt(tag)];

    try {
      const add = await this.client.CreateMovie(movieData);

      if (Array.isArray(add)) {
        if (add[1].errorMessage) throw add[1].errorMessage;
      }
      return add.id;
    } catch (err) {
      logger.warn(
        `SERVICE - RADARR: [${this.instance.name}] Unable to add movie`,
        { label: 'downloaders.radarr' },
      );
      logger.log(err, { label: 'downloaders.radarr' });
      throw err;
    }
  }

  async processJobs(jobQ, allInstances = false) {
    for (const job of jobQ) {
      // Target server
      if (allInstances) {
        try {
          const radarrData = await this.client.LookupMovie(job.tmdb_id);
          let radarrId = -1;
          if (radarrData[0].id) {
            logger.debug(
              `SERVICE - RADARR: [${this.instance.name}] Job skipped already found for ${job.title}`,
              { label: 'downloaders.radarr' },
            );
            radarrId = radarrData[0].id;
          } else {
            radarrId = await this.add(radarrData[0]);
            logger.debug(
              `SERVICE - RADARR: [${this.instance.name}] Radarr job added for ${job.title}`,
              { label: 'downloaders.radarr' },
            );
          }
          if (!this.instance.id) {
            return;
          }
          await Request.findOneAndUpdate(
            {
              requestId: job.requestId,
            },
            { $push: { radarrId: { [this.instance.id]: radarrId } } },
            { useFindAndModify: false },
          ).exec();
        } catch (err) {
          logger.error(
            `SERVICE - RADARR: [${this.instance.name}] Unable to add movie ${job.title}`,
            { label: 'downloaders.radarr' },
          );
          logger.error(err, { label: 'downloaders.radarr' });
        }
      } else {
        // Loop for all servers default
        const instances = await GetAllDownloaders(DownloaderType.Radarr);
        for (const instance of instances) {
          if (!instance.enabled) {
            logger.debug(
              `SERVICE - RADARR: [${instance.name}] Server not active`,
              { label: 'downloaders.radarr' },
            );
            return;
          }

          try {
            const url = new URL(instance.url);
            const api = new RadarrAPI(url, instance.token);

            const radarrData = await api.LookupMovie(job.tmdb_id);
            let radarrId = -1;
            if (radarrData[0].id) {
              logger.debug(
                `SERVICE - RADARR: [${instance.name}] Job skipped already found for ${job.title}`,
                { label: 'downloaders.radarr' },
              );
              radarrId = radarrData[0].id;
            } else {
              radarrId = await this.add(radarrData[0]);
              logger.debug(
                `SERVICE - RADARR: [${instance.name}] Radarr job added for ${job.title}`,
                { label: 'downloaders.radarr' },
              );
            }
            if (!instance.id) {
              continue;
            }

            await Request.findOneAndUpdate(
              {
                requestId: job.requestId,
              },
              { $push: { radarrId: { [instance.id]: radarrId } } },
              { useFindAndModify: false },
            ).exec();
          } catch (err) {
            logger.error(
              `SERVICE - RADARR: [${this.instance.name}] Unable to add movie ${job.title}`,
              { label: 'downloaders.radarr' },
            );
            logger.log(err, { label: 'downloaders.radarr' });
          }
        }
      }
    }
  }

  async manualAdd(job, manual) {
    try {
      const radarrData = await this.client.LookupMovie(job.id);
      let radarrId = -1;
      if (radarrData[0] && radarrData[0].id) {
        logger.debug(
          `SERVICE - RADARR: [${this.instance.name}] Job skipped already found for ${job.title}`,
          { label: 'downloaders.radarr' },
        );
        radarrId = radarrData[0].id;
      } else {
        radarrId = await this.add(
          radarrData[0],
          manual.path,
          manual.profile,
          manual.tag,
        );
        logger.debug(
          `SERVICE - RADARR: [${this.instance.name}] Radarr job added for ${job.title}`,
          { label: 'downloaders.radarr' },
        );
      }
      if (!this.instance.id) {
        return;
      }
      await Request.findOneAndUpdate(
        {
          requestId: job.id,
        },
        { $push: { radarrId: { [this.instance.id]: radarrId } } },
        { useFindAndModify: false },
      ).exec();
    } catch (err) {
      logger.error(
        `SERVICE - RADARR: [${this.instance.name}] Unable to add movie ${job.title}`,
        { label: 'downloaders.radarr' },
      );
      logger.log(err, { label: 'downloaders.radarr' });
    }
  }

  async processRequest(id) {
    logger.debug(`SERVICE - RADARR: Processing request`, {
      label: 'downloaders.radarr',
    });
    const req = await Request.findOne({ requestId: id }).exec();
    if (!req) {
      logger.debug(`SERVICE - RADARR: no request found`, {
        label: 'downloaders.radarr',
      });
      return;
    }

    if (req.type === 'movie') {
      if (!req.tmdb_id) {
        logger.debug(`SERVICE - RADARR: TMDB ID not found for ${req.title}`, {
          label: 'downloaders.radarr',
        });
      } else if (req.radarrId.length === 0) {
        if (!req.approved) {
          logger.debug(
            `SERVICE - RADARR: Request requires approval - ${req.title}`,
            { label: 'downloaders.radarr' },
          );
        } else {
          logger.debug('SERVICE - RADARR: Request passed to queue', {
            label: 'downloaders.radarr',
          });
          this.processJobs([req]);
        }
      }
    }
  }
}
