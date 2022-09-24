import Bluebird from 'bluebird';

import { config } from '@/config/index';
import logger from '@/loaders/logger';
import { DownloaderType, GetAllDownloaders } from '@/models/downloaders';
import Request from '@/models/request';
import Radarr from '@/services/downloaders/radarr';
import Sonarr from '@/services/downloaders/sonarr';
import { movieLookup } from '@/services/tmdb/movie';
import { showLookup } from '@/services/tmdb/show';

export const getRequests = async (user = false, all = false) => {
  let data = {};
  try {
    const requests = await Request.find().exec();

    const instances = await GetAllDownloaders();
    const sonarrs = instances.filter((i) => i.type === DownloaderType.Sonarr);
    const radarrs = instances.filter((i) => i.type === DownloaderType.Radarr);

    const [sonarrQ, radarrQ] = await Bluebird.all([
      Bluebird.map(sonarrs, async (i) => new Sonarr(i).queue()),
      Bluebird.map(radarrs, async (i) => new Radarr(i).queue()),
    ]);

    data = {};

    await Bluebird.all(
      Bluebird.map(
        requests,
        async (request: any, _i) => {
          const children: any = [];
          let media: any = [];
          if (request.users.includes(user) || all) {
            if (request.type === 'movie' && request.radarrId.length > 0) {
              for (let i = 0; i < Object.keys(request.radarrId).length; i++) {
                const radarrIds = request.radarrId[i];
                const rId = parseInt(radarrIds[Object.keys(radarrIds)[0]]);
                const serverUuid = Object.keys(radarrIds)[0];

                const instance = instances.find((i) => i.id === serverUuid);
                if (!instance) {
                  return;
                }

                const server = new Radarr(instance);
                children[i] = {};
                children[i].id = rId;
                try {
                  children[i].info = await server.getClient().GetMovie(rId);
                  children[i].info.serverName = server.instance.name;
                } catch {
                  children[i].info = { message: 'NotFound' };
                }
                children[i].status = [];
                if (radarrQ[serverUuid] && radarrQ[serverUuid].records) {
                  for (const element of radarrQ[serverUuid].records) {
                    if (element.movieId === rId) {
                      children[i].status.push(element);
                    }
                  }
                }
              }
            }

            if (request.type === 'tv' && request.sonarrId.length > 0) {
              for (let i = 0; i < Object.keys(request.sonarrId).length; i++) {
                const sonarrIds = request.sonarrId[i];
                const sId = parseInt(sonarrIds[Object.keys(sonarrIds)[0]]);
                const serverUuid = Object.keys(sonarrIds)[0];

                const instance = instances.find((i) => i.id === serverUuid);
                if (!instance) {
                  continue;
                }

                const server = new Sonarr(instance);
                children[i] = {};
                children[i].id = sId;
                try {
                  children[i].info = await server
                    .getClient()
                    .GetSeriesById(sId);
                  children[i].info.serverName = server.instance.name;
                } catch (e) {
                  children[i].info = { message: 'NotFound', error: e };
                }
                children[i].status = [];
                if (sonarrQ[serverUuid] && sonarrQ[serverUuid].records) {
                  for (const element of sonarrQ[serverUuid].records) {
                    if (element.seriesId === sId) {
                      children[i].status.push(element);
                    }
                  }
                }
              }
            }

            if (request.type === 'movie') {
              media = await movieLookup(request.requestId, true);
            } else if (request.type === 'tv') {
              media = await showLookup(request.requestId, true);
            }

            data[request.requestId] = {
              title: request.title,
              children,
              requestId: request.requestId,
              type: request.type,
              thumb: request.thumb,
              imdb_id: request.imdb_id,
              tmdb_id: request.tmdb_id,
              tvdb_id: request.tvdb_id,
              users: request.users,
              sonarrId: request.sonarrId,
              radarrId: request.radarrId,
              media,
              approved: request.approved,
              manualStatus: request.manualStatus,
              process_stage: reqState(request, children),
              defaults: request.pendingDefault,
            };

            if (request.type === 'tv') {
              data[request.requestId].seasons = request.seasons;
            }
          }
        },
        { concurrency: config.get('general.concurrency') },
      ),
    );
  } catch (err) {
    logger.error(err.stack);
    logger.error(`ROUTE: Error getting requests display`, {
      label: 'requests.display',
    });
    logger.error(err, { label: 'requests.display' });
    data = requests;
  }
  return data;
};

function reqState(req, children) {
  let diff;
  if (!req.approved) {
    return {
      status: 'pending',
      message: 'Pending',
      step: 2,
    };
  }
  if (children) {
    if (children.length > 0) {
      for (const element of children) {
        if (element.status.length > 0) {
          return {
            status: 'orange',
            message: 'Downloading',
            step: 3,
          };
        }

        if (element.info.downloaded || element.info.movieFile) {
          return {
            status: 'good',
            message: 'Downloaded',
            step: 4,
          };
        }

        if (element.info.message === 'NotFound') {
          return {
            status: 'bad',
            message: 'Removed',
            step: 2,
          };
        }

        if (req.type === 'tv' && element.info) {
          if (
            element.info.episodeCount === element.info.episodeFileCount &&
            element.info.episodeCount > 0
          ) {
            return {
              status: 'good',
              message: 'Downloaded',
              step: 4,
            };
          }

          if (element.info.seasons) {
            let missing = false;
            for (const season of element.info.seasons) {
              if (season.monitored) {
                if (
                  season.statistics &&
                  season.statistics.percentOfEpisodes !== 100
                )
                  missing = true;
              }
            }

            if (!missing && element.info.statistics.totalEpisodeCount > 0) {
              return {
                status: 'good',
                message: 'Downloaded',
                step: 4,
              };
            }
              const airDate = element.info.firstAired;
              if (!airDate)
                return {
                  status: 'blue',
                  message: 'Awaiting Info',
                  step: 3,
                };
              diff = Math.ceil(
                new Date(airDate).getTime() - new Date().getTime(),
              );
              if (diff > 0) {
                return {
                  status: 'blue',
                  message: `${calcDate(diff)}`,
                  step: 3,
                };
              }
                if (element.info.episodeFileCount > 0) {
                  return {
                    status: 'blue',
                    message: 'Partially Downloaded',
                    step: 3,
                  };
                }


          }
        }

        if (req.type === 'movie' && element.info) {
          if (element.info.inCinemas || element.info.digitalRelease) {
            if (element.info.inCinemas) {
              diff = Math.ceil(
                new Date(element.info.inCinemas).getTime() -
                  new Date().getTime(),
              );
              if (diff > 0) {
                return {
                  status: 'blue',
                  message: `${calcDate(diff)}`,
                  step: 3,
                };
              }
            }
            if (element.info.digitalRelease) {
              const digitalDate = new Date(element.info.digitalRelease);
              if (new Date().getTime() - digitalDate.getTime() < 0) {
                return {
                  status: 'cinema',
                  message: 'In Cinemas',
                  step: 3,
                };
              }
            } else if (element.info.inCinemas) {
                diff = Math.ceil(
                  new Date().getTime() -
                    new Date(element.info.inCinemas).getTime(),
                );
                if (cinemaWindow(diff)) {
                  return {
                    status: 'cinema',
                    message: 'In Cinemas',
                    step: 3,
                  };
                }
              }
          }

          if (element.info.status === 'announced') {
            return {
              status: 'blue',
              message: 'Awaiting Info',
              step: 3,
            };
          }
        }
      }
      return {
        status: 'bad',
        message: 'Unavailable',
        step: 3,
      };
    }
  }

  if (req.manualStatus) {
    switch (req.manualStatus) {
      case 3:
        return {
          status: 'orange',
          message: 'Processing',
          step: 3,
        };
      case 4:
        return {
          status: 'good',
          message: 'Finalising',
          step: 4,
        };
      case 5:
        return {
          status: 'good',
          message: 'Complete',
          step: 5,
        };
    }
  }

  return {
    status: 'manual',
    message: 'No Status',
    step: 3,
  };
}

function calcDate(diff) {
  const day = 1000 * 60 * 60 * 24;

  let days = Math.ceil(diff / day);
  let months = Math.floor(days / 31);
  const years = Math.floor(months / 12);
  days -= months * 31;
  months -= years * 12;

  let message = '~';
  message += years ? `${years  }y ` : '';
  message += months ? `${months  }m ` : '';
  message += days ? `${days  }d` : '';
  if (years) message = '> 1y';

  return message;
}

function cinemaWindow(diff) {
  const day = 1000 * 60 * 60 * 24;
  const days = Math.ceil(diff / day);
  if (days >= 62) {
    return false;
  }
  return true;
}
