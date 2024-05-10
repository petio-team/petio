import Router from '@koa/router';
import Bluebird from 'bluebird';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import { getFromContainer } from '@/infra/container/container';
import logger from '@/infra/logger/logger';
import { DownloaderEntity } from '@/resources/downloader/entity';
import { DownloaderRepository } from '@/resources/downloader/repository';
import { RequestRepository } from '@/resources/request/repository';
import { UserRepository } from '@/resources/user/repository';
import Radarr from '@/services/downloaders/radarr';
import Sonarr from '@/services/downloaders/sonarr';
import Mailer from '@/services/mail/mailer';
import { getArchive } from '@/services/requests/archive';
import {
  getAllRequests,
  getAllUserRequests,
} from '@/services/requests/display';
import ProcessRequest from '@/services/requests/process';
import is from '@/utils/is';

const listRequests = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  ctx.body = await getAllRequests();
};

const getUserRequests = async (ctx: Context) => {
  try {
    const userId = ctx.state.user.id;
    if (!userId) {
      ctx.error({
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
      return;
    }
    const requests = await getAllUserRequests(userId);
    ctx.ok(requests);
  } catch (err) {
    logger.error(`Error getting user requests`, err);
    ctx.error({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal Server Error',
    });
  }
};

const getRequestMinified = async (ctx: Context) => {
  try {
    const requests = await getFromContainer(RequestRepository).findAll({});
    if (requests.length === 0) {
      ctx.status = StatusCodes.OK;
      ctx.body = {};
      return;
    }

    const data = {};
    await Promise.all(
      requests.map(async (request) => {
        if (!request.id) {
          return;
        }
        data[request.id] = {
          title: request.title,
          requestId: request.id,
          type: request.type,
          thumb: request.thumbnail,
          imdb_id: request.imdbId,
          tmdb_id: request.tmdbId,
          tvdb_id: request.tvdbId,
          users: request.users,
          sonarrId: request.sonarrs,
          radarrId: request.radarrs,
          approved: request.approved,
          defaults: request.pending,
        };
        if (request.type === 'tv') {
          data[request.id].seasons = request.seasons;
        }
      }),
    );
    ctx.status = StatusCodes.OK;
    ctx.body = data;
  } catch (err) {
    logger.error(`ROUTE: Error getting requests`, err);
    ctx.error({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal Server Error',
    });
    return;
  }
};

const addRequest = async (ctx: Context) => {
  const { body } = ctx.request;
  const { request } = body;

  try {
    ctx.status = StatusCodes.OK;
    ctx.body = await new ProcessRequest(request, ctx.state.user).new();
  } catch (err) {
    logger.error(`ROUTE: Error adding request`, err);
    ctx.error({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal Server Error',
    });
  }
};

const removeRequest = async (ctx: Context) => {
  const { body } = ctx.request;

  const { request } = body;
  const { reason } = body;
  const process = new ProcessRequest(request, ctx.state.user);

  await process.archive(false, true, reason);

  process.removeFromDVR();

  const emails: any = [];
  const titles: any = [];

  await Promise.all(
    request.users.map(async (user) => {
      const userResult = await getFromContainer(UserRepository).findOne({
        id: user,
      });
      if (userResult.isNone()) {
        ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
        ctx.body = { error: 'failed to find requests by user' };
        return;
      }
      const userData = userResult.unwrap();

      emails.push(userData.email);
      titles.push(userData.title);
    }),
  );
  new Mailer().mail(
    `Your request was ${request.approved ? 'removed' : 'denied'} for ${
      request.title
    }`,
    `Your request was ${request.approved ? 'removed' : 'denied'} for ${
      request.title
    }`,
    `Unfortunately your request could not be processed.${
      reason ? ` This is because - ${reason}.` : ''
    } Thanks for your request anyway!`,
    `https://image.tmdb.org/t/p/w500${request.thumb}`,
    emails,
    titles,
  );

  ctx.status = StatusCodes.OK;
  ctx.body = { message: 'successfully removed request' };
};

const updateRequest = async (ctx: Context) => {
  const { body } = ctx.request;

  const { request } = body;
  const { servers } = body;
  const { approved } = body.request;
  const { manualStatus } = body.request;

  if (manualStatus === '5') {
    new ProcessRequest(request, ctx.state.user).archive(true, false, '');
    ctx.status = StatusCodes.OK;
    ctx.body = {};
    return;
  }

  try {
    await getFromContainer(RequestRepository).updateMany(
      { requestId: request.requestId },
      {
        $set: {
          approved: true,
          manualStatus,
        },
      },
    );

    const instances = await getFromContainer(DownloaderRepository).findAll();
    if (servers && servers.length) {
      const activeServers: DownloaderEntity[] = servers
        .map((s) => {
          if (s.active) {
            const instance = instances.find((i) => i.id === s.id);
            if (instance) {
              return instance;
            }
            return undefined;
          }
          return undefined;
        })
        .filter(is.truthy);

      await Bluebird.map(activeServers, async (instance) => {
        if (request.type === 'movie') {
          await new Radarr(instance).processRequest(request.requestId);
        } else {
          await new Sonarr(instance).addShow(request, {
            profile: instance.metadata.profile,
            path: instance.metadata.path,
          });
        }
      });
    }

    if (!approved) {
      const emails: any = [];
      const titles: any = [];
      await Promise.all(
        request.users.map(async (id) => {
          const userData = await getFromContainer(UserRepository).findOne({
            id,
          });
          if (userData.isNone()) {
            return;
          }
          const user = userData.unwrap();
          emails.push(user.email);
          titles.push(user.title);
        }),
      );
      const requestData = request;
      const type = requestData.type === 'tv' ? 'TV Show' : 'Movie';
      new Mailer().mail(
        `Request approved for ${requestData.title}`,
        `${type}: ${requestData.title}`,
        `Your request has been reviewed and has been approved. You'll receive an email once it has been added to Plex!`,
        `https://image.tmdb.org/t/p/w500${requestData.thumb}`,
        emails,
        titles,
      );
    }

    ctx.status = StatusCodes.OK;
    ctx.body = {};
  } catch (err) {
    logger.error(`ROUTE: Error updating requests`, err);
    ctx.error({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal Server Error',
    });
  }
};

const getArchivedRequestById = async (ctx: Context) => {
  const { id } = ctx.params;

  ctx.status = StatusCodes.OK;
  ctx.body = await getArchive(id);
};

const routes = new Router({ prefix: '/request' });
export default (app: Router) => {
  routes.get('/all', listRequests);
  routes.get('/min', getRequestMinified);
  routes.post('/add', addRequest);
  routes.get('/me', getUserRequests);
  routes.post('/remove', removeRequest);
  routes.post('/update', updateRequest);
  routes.get('/archive/:id', getArchivedRequestById);

  app.use(routes.routes());
  app.use(routes.allowedMethods());
};
