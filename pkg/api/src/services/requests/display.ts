/* eslint-disable no-restricted-syntax */

/* eslint-disable import/prefer-default-export */
import Bluebird from 'bluebird';

import { Movie } from '@/infra/arr/radarr/v4/movie';
import { Series } from '@/infra/arr/sonarr/v3/series';
import logger from '@/infra/logger/logger';
import {
  DownloaderType,
  GetAllDownloaders,
  IDownloader,
} from '@/models/downloaders';
import Request, { IRequest } from '@/models/request';
import Radarr from '@/services/downloaders/radarr';
import Sonarr from '@/services/downloaders/sonarr';
import { movieLookup } from '@/services/tmdb/movie';
import { showLookup } from '@/services/tmdb/show';

import {
  RequestChildren,
  RequestOutput,
  RequestState,
  isDownloaderMovie,
  isDownloaderSeries,
} from './types';
import { calcDate, cinemaWindow } from './utils';

function reqState(req: IRequest, children: RequestChildren[]): RequestState {
  let diff: number;
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

        if ('message' in element.info && element.info.message === 'Not Found') {
          return {
            status: 'bad',
            message: 'Removed',
            step: 2,
          };
        }

        if (req.type === 'tv' && isDownloaderSeries(element.info)) {
          const data = element.info as Series;
          if (
            data.statistics.episodeCount === data.statistics.episodeFileCount &&
            data.statistics.episodeCount > 0
          ) {
            return {
              status: 'good',
              message: 'Downloaded',
              step: 4,
            };
          }

          if (data.seasons) {
            let missing = false;
            for (const season of data.seasons) {
              if (season.monitored) {
                if (
                  season.statistics &&
                  season.statistics.percentOfEpisodes !== 100
                )
                  missing = true;
              }
            }

            if (!missing && data.statistics.totalEpisodeCount > 0) {
              return {
                status: 'good',
                message: 'Downloaded',
                step: 4,
              };
            }
            const airDate = data.firstAired;
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
            if (data.statistics.episodeFileCount > 0) {
              return {
                status: 'blue',
                message: 'Partially Downloaded',
                step: 3,
              };
            }
          }
        }

        if (req.type === 'movie' && isDownloaderMovie(element.info)) {
          const data = element.info as Movie;
          if (data.hasFile) {
            return {
              status: 'good',
              message: 'Downloaded',
              step: 4,
            };
          }
          if (data.inCinemas || data.digitalRelease) {
            if (data.inCinemas) {
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
            if (data.digitalRelease) {
              const digitalDate = new Date(data.digitalRelease);
              if (new Date().getTime() - digitalDate.getTime() < 0) {
                return {
                  status: 'cinema',
                  message: 'In Cinemas',
                  step: 3,
                };
              }
            } else if (data.inCinemas) {
              diff = Math.ceil(
                new Date().getTime() - new Date(data.inCinemas).getTime(),
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

          if (data.status === 'announced') {
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
      case 3: {
        return {
          status: 'orange',
          message: 'Processing',
          step: 3,
        };
      }
      case 4: {
        return {
          status: 'good',
          message: 'Finalising',
          step: 4,
        };
      }
      case 5: {
        return {
          status: 'good',
          message: 'Complete',
          step: 5,
        };
      }
      default: {
        return {
          status: 'error',
          message: 'No Status',
          step: -1,
        };
      }
    }
  }

  return {
    status: 'manual',
    message: 'No Status',
    step: 3,
  };
}

function makeOutput(request: IRequest): RequestOutput {
  return {
    [request.requestId]: {
      title: request.title,
      children: [],
      requestId: request.requestId,
      type: request.type,
      thumb: request.thumb,
      imdb_id: request.imdb_id,
      tmdb_id: request.tmdb_id,
      tvdb_id: request.tvdb_id,
      users: request.users,
      sonarrId: request.sonarrId,
      radarrId: request.radarrId,
      media: {},
      approved: request.approved,
      manualStatus: request.manualStatus,
      process_stage: reqState(request, []),
      defaults: request.pendingDefault,
      seasons: request.type === 'tv' ? request.seasons : undefined,
    },
  };
}

async function getRequestsForMovies(
  radarrs: IDownloader[],
  requests: IRequest[],
) {
  const results = await Bluebird.map(requests, async (request) => {
    const output = makeOutput(request);
    try {
      const lookup = await movieLookup(request.requestId, true);
      const instance = radarrs.find((r) => request.radarrId.includes(r.id));
      if (instance) {
        try {
          const client = new Radarr(instance).getClient();
          const movieId = parseInt(request.radarrId[0], 10);

          const [movie, queue] = await Promise.all([
            client.GetMovie(movieId),
            client.GetQueue(),
          ]);

          const status = queue.items.filter((q) => q.id === movieId);

          output[request.requestId].children.push({
            id: movieId,
            info: {
              ...movie,
              serverName: instance.name,
            },
            status,
          });
          output[request.requestId].process_stage = reqState(
            request,
            output[request.requestId].children,
          );
        } catch (error) {
          logger.error(
            `failed to get movie ${request.radarrId[0]} from ${instance.name}`,
            error,
          );
          output[request.requestId].children.push({
            id: -1,
            info: {
              message: 'Not Found',
            },
            status: [],
          });
        }
      }
      output[request.requestId].media = lookup;
      return output;
    } catch (error) {
      logger.error(`failed to get movie ${request.requestId}`, error);
      return output;
    }
  });
  if (results.length > 0) {
    return results.reduce((acc, curr) => ({ ...acc, ...curr }));
  }
  return results;
}

async function getRequestsForShows(
  sonarrs: IDownloader[],
  requests: IRequest[],
) {
  const results = await Bluebird.map(requests, async (request) => {
    const output = makeOutput(request);
    try {
      const lookup = await showLookup(request.requestId, true);
      const instance = sonarrs.find((s) => request.sonarrId.includes(s.id));
      if (instance) {
        try {
          const client = new Sonarr(instance).getClient();
          const seriesId = parseInt(request.sonarrId[0], 10);

          const [series, queue] = await Promise.all([
            client.GetSeriesById(seriesId),
            client.GetQueue(),
          ]);

          const status = queue.items.filter((q) => q.id === seriesId);

          output[request.requestId].children.push({
            id: seriesId,
            info: {
              ...series,
              serverName: instance.name,
            },
            status,
          });
          output[request.requestId].process_stage = reqState(
            request,
            output[request.requestId].children,
          );
        } catch (error) {
          logger.error(
            `failed to get show ${request.sonarrId[0]} from ${instance.name}`,
            error,
          );
          output[request.requestId].children.push({
            id: -1,
            info: {
              message: 'Not Found',
            },
            status: [],
          });
        }
      }
      output[request.requestId].media = lookup;
      return output;
    } catch (error) {
      logger.error(`failed to get show ${request.requestId}`, error);
      return output;
    }
  });
  if (results.length > 0) {
    return results.reduce((acc, curr) => ({ ...acc, ...curr }));
  }
  return results;
}

export async function getAllRequests() {
  try {
    const [requests, instances] = await Promise.all([
      Request.find({}),
      GetAllDownloaders(),
    ]);

    if (requests.length === 0) {
      return {};
    }

    const sonarrs = instances.filter(
      (instance) => instance.type === DownloaderType.Sonarr,
    );
    const radarrs = instances.filter(
      (instance) => instance.type === DownloaderType.Radarr,
    );

    const movieRequests = requests.filter(
      (request) => request.type === 'movie',
    );
    const tvRequests = requests.filter((request) => request.type === 'tv');

    const [movieStatus, tvStatus] = await Promise.all([
      getRequestsForMovies(radarrs, movieRequests),
      getRequestsForShows(sonarrs, tvRequests),
    ]);

    if (
      Object.keys(movieStatus).length === 0 &&
      Object.keys(tvStatus).length === 0
    ) {
      return requests.map((request) => makeOutput(request));
    }

    return { ...movieStatus, ...tvStatus };
  } catch (error) {
    logger.error('failed to get requests', error);
    return {};
  }
}

export async function getAllUserRequests(userId: string) {
  try {
    const [requests, instances] = await Promise.all([
      Request.find({
        users: {
          $in: [userId],
        },
      }),
      GetAllDownloaders(),
    ]);

    if (requests.length === 0) {
      return {};
    }

    const sonarrs = instances.filter(
      (instance) => instance.type === DownloaderType.Sonarr,
    );
    const radarrs = instances.filter(
      (instance) => instance.type === DownloaderType.Radarr,
    );

    const movieRequests = requests.filter(
      (request) => request.type === 'movie',
    );
    const tvRequests = requests.filter((request) => request.type === 'tv');

    const [movieStatus, tvStatus] = await Promise.all([
      getRequestsForMovies(radarrs, movieRequests),
      getRequestsForShows(sonarrs, tvRequests),
    ]);

    if (
      Object.keys(movieStatus).length === 0 &&
      Object.keys(tvStatus).length === 0
    ) {
      return requests.map((request) => makeOutput(request));
    }

    return { ...movieStatus, ...tvStatus };
  } catch (error) {
    logger.error('failed to get user requests', error);
    return {};
  }
}
