import axios from 'axios';
import { URL, URLSearchParams } from 'url';

import logger from '@/loaders/logger';
import { IDownloader } from '@/models/downloaders';
import Request from '@/models/request';

import RadarrAPI from '../arr/radarr';

export default class Radarr {
  instances: IDownloader[];

  constructor(instances: IDownloader[]) {
    this.instances = instances;
  }

  async process(method, endpoint, params = {}, body = {}) {
    if (!this.config.host) {
      return;
    }
    const baseurl = `${this.config.protocol}://${this.config.host}${
      this.config.port ? ':' + this.config.port : ''
    }${this.config.subpath == '/' ? '' : this.config.subpath}/api/v3/`;
    const apiurl = new URL(endpoint, baseurl);
    const prms = new URLSearchParams();

    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        prms.set(key, params[key]);
      }
    }

    prms.set('apikey', this.config.key);
    apiurl.search = prms.toString();

    let res;
    switch (method) {
      case 'post':
        res = await axios.post(apiurl.toString(), body);
        break;
      case 'get':
        res = await axios.get(apiurl.toString());
        break;
      case 'delete':
        res = await axios.delete(apiurl.toString(), body);
        break;
      case 'put':
        res = await axios.put(apiurl.toString(), body);
        break;
      default:
        res = await axios.get(apiurl.toString());
    }

    if (!res.data || typeof res.data !== 'object') {
      return Error('not a valid object');
    }
    return res.data;
  }

  getInstances(): IDownloader[] {
    return this.instances;
  }

  async connect(test = false) {
    if (!this.config || this.config.title == 'Server Removed') {
      return false;
    }
    if (!this.config.enabled && !test) {
      logger.verbose('SERVICE - RADARR: Radarr not enabled', {
        label: 'downloaders.radarr',
      });
      return false;
    }
    try {
      let check = await this.get('system/status');
      if (check.error) {
        logger.warn(
          `SERVICE - RADARR: [${this.config.title}] ERR Connection failed`,
          { label: 'downloaders.radarr' },
        );
        return false;
      }
      if (check) {
        return check;
      } else {
        logger.warn(
          `SERVICE - RADARR: [${this.config.title}] ERR Connection failed`,
          { label: 'downloaders.radarr' },
        );
        return false;
      }
    } catch (err) {
      logger.warn(
        `SERVICE - RADARR: [${this.config.title}] ERR Connection failed`,
        { label: 'downloaders.radarr' },
      );
      return false;
    }
  }

  async refresh() {
    return this.post('command', false, {
      name: 'RefreshMonitoredDownloads',
    });
  }

  async movie(id) {
    const active = await this.connect();
    if (!active) {
      return false;
    }
    try {
      return this.get(`movie/${id}`);
    } catch {
      return false;
    }
  }

  async remove(id) {
    const active = await this.connect();
    if (!active) {
      return false;
    }
    try {
      return this.delete(`movie/${id}`);
    } catch {
      logger.warn('RADARR: Unable to remove job, likely already removed', {
        label: 'downloaders.radarr',
      });
    }
  }

  async queue() {
    let queue = {};

    for (let i = 0; i < this.fullConfig.length; i++) {
      this.config = this.fullConfig[i];
      const active = await this.connect();
      if (!active) {
        return false;
      }
      // await this.refresh();
      queue[this.config.uuid] = await this.get(`queue`);
      let totalRecords = queue[this.config.uuid].totalRecords;
      let pageSize = queue[this.config.uuid].pageSize;
      let pages = Math.ceil(totalRecords / pageSize);
      for (let p = 2; p <= pages; p++) {
        let queuePage = await this.get('queue', {
          page: p,
        });
        queue[this.config.uuid].records = [
          ...queue[this.config.uuid].records,
          ...queuePage.records,
        ];
      }
      queue[this.config.uuid]['serverName'] = this.config.title;
    }
    return queue;
  }

  async test() {
    return await this.connect(true);
  }

  async add(movieData, path = false, profile = false, tag: any = false) {
    movieData.qualityProfileId = parseInt(
      profile ? profile : this.config.profile.id,
    );
    movieData.rootFolderPath = `${path ? path : this.config.path.location}`;
    movieData.addOptions = {
      searchForMovie: true,
    };
    movieData.monitored = true;
    if (tag) movieData.tags = [parseInt(tag)];

    try {
      let add = await this.post('movie', false, movieData);

      if (Array.isArray(add)) {
        if (add[1].errorMessage) throw add[1].errorMessage;
      }
      return add.id;
    } catch (err) {
      logger.warn(
        `SERVICE - RADARR: [${this.config.title}] Unable to add movie`,
        { label: 'downloaders.radarr' },
      );
      logger.log(err, { label: 'downloaders.radarr' });
      throw err;
    }
  }

  async processJobs(jobQ) {
    for (let job of jobQ) {
      // Target server
      if (this.config) {
        try {
          let radarrData = await this.lookup(job.tmdb_id);
          let radarrId = false;
          if (radarrData[0].id) {
            logger.verbose(
              `SERVICE - RADARR: [${this.config.title}] Job skipped already found for ${job.title}`,
              { label: 'downloaders.radarr' },
            );
            radarrId = radarrData[0].id;
          } else {
            radarrId = await this.add(radarrData[0]);
            logger.verbose(
              `SERVICE - RADARR: [${this.config.title}] Radarr job added for ${job.title}`,
              { label: 'downloaders.radarr' },
            );
          }
          await Request.findOneAndUpdate(
            {
              requestId: job.requestId,
            },
            { $push: { radarrId: { [this.config.uuid]: radarrId } } },
            { useFindAndModify: false },
          );
        } catch (err) {
          logger.error(
            `SERVICE - RADARR: [${this.config.title}] Unable to add movie ${job.title}`,
            { label: 'downloaders.radarr' },
          );
          logger.error(err, { label: 'downloaders.radarr' });
        }
      } else {
        // Loop for all servers default
        for (let server of this.fullConfig) {
          if (!server.enabled) {
            logger.verbose(
              `SERVICE - RADARR: [${server.title}] Server not active`,
              { label: 'downloaders.radarr' },
            );
            return;
          }

          this.config = server;
          try {
            let radarrData = await this.lookup(job.tmdb_id);
            let radarrId = false;
            if (radarrData[0].id) {
              logger.verbose(
                `SERVICE - RADARR: [${this.config.title}] Job skipped already found for ${job.title}`,
                { label: 'downloaders.radarr' },
              );
              radarrId = radarrData[0].id;
            } else {
              radarrId = await this.add(radarrData[0]);
              logger.verbose(
                `SERVICE - RADARR: [${this.config.title}] Radarr job added for ${job.title}`,
                { label: 'downloaders.radarr' },
              );
            }

            await Request.findOneAndUpdate(
              {
                requestId: job.requestId,
              },
              { $push: { radarrId: { [this.config.uuid]: radarrId } } },
              { useFindAndModify: false },
            );
          } catch (err) {
            logger.error(
              `SERVICE - RADARR: [${this.config.title}] Unable to add movie ${job.title}`,
              { label: 'downloaders.radarr' },
            );
            logger.log(err, { label: 'downloaders.radarr' });
          }
        }
      }
    }
  }

  async manualAdd(job, manual) {
    if (this.config) {
      try {
        let radarrData = await this.lookup(job.id);
        let radarrId = false;
        if (radarrData[0] && radarrData[0].id) {
          logger.verbose(
            `SERVICE - RADARR: [${this.config.title}] Job skipped already found for ${job.title}`,
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
          logger.verbose(
            `SERVICE - RADARR: [${this.config.title}] Radarr job added for ${job.title}`,
            { label: 'downloaders.radarr' },
          );
        }
        await Request.findOneAndUpdate(
          {
            requestId: job.id,
          },
          { $push: { radarrId: { [this.config.uuid]: radarrId } } },
          { useFindAndModify: false },
        );
      } catch (err) {
        logger.error(
          `SERVICE - RADARR: [${this.config.title}] Unable to add movie ${job.title}`,
          { label: 'downloaders.radarr' },
        );
        logger.log(err, { label: 'downloaders.radarr' });
      }
    }
  }

  async processRequest(id) {
    logger.verbose(`SERVICE - RADARR: Processing request`, {
      label: 'downloaders.radarr',
    });
    if (!this.fullConfig || this.fullConfig.length === 0) {
      logger.verbose(`SERVICE - RADARR: No active servers`, {
        label: 'downloaders.radarr',
      });
      return;
    }

    const req = await Request.findOne({ requestId: id });
    if (req.type === 'movie') {
      if (!req.tmdb_id) {
        logger.verbose(`SERVICE - RADARR: TMDB ID not found for ${req.title}`, {
          label: 'downloaders.radarr',
        });
      } else if (req.radarrId.length === 0) {
        if (!req.approved) {
          logger.verbose(
            `SERVICE - RADARR: Request requires approval - ${req.title}`,
            { label: 'downloaders.radarr' },
          );
        } else {
          logger.verbose('SERVICE - RADARR: Request passed to queue', {
            label: 'downloaders.radarr',
          });
          this.processJobs([req]);
        }
      }
    }
  }

  async calendar() {
    let mainCalendar: any = [];
    let now = new Date();
    for (let server of this.instances) {
      if (server.enabled) {
        const url = new URL(server.url);
        const api = new RadarrAPI(url, server.token);

        try {
          const calendar = await api.Calendar(
            true,
            new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(),
            new Date(now.getFullYear(), now.getMonth() + 2, 1).toISOString(),
          );

          mainCalendar = [...mainCalendar, ...calendar];
        } catch (err) {
          logger.error('RADARR: Calendar error', {
            label: 'downloaders.radarr',
          });
          logger.error(err, { label: 'downloaders.radarr' });
        }
      }
    }
    logger.verbose('RADARR: Calendar returned', {
      label: 'downloaders.radarr',
    });

    return mainCalendar;
  }
}
