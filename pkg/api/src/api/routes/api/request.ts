import Router from '@koa/router';
import Bluebird from 'bluebird';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import logger from '@/loaders/logger';
import { GetAllDownloaders, IDownloader } from '@/models/downloaders';
import Request from '@/models/request';
import { UserModel } from '@/models/user';
import Radarr from '@/services/downloaders/radarr';
import Sonarr from '@/services/downloaders/sonarr';
import Mailer from '@/services/mail/mailer';
import { getArchive } from '@/services/requests/archive';
import { getRequests } from '@/services/requests/display';
import processRequest from '@/services/requests/process';

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

const listRequests = async (ctx: Context) => {
  ctx.status = StatusCodes.OK;
  ctx.body = await getRequests(false, true);
};

const getUserRequests = async (ctx: Context) => {
  let userId = ctx.state.user.id;
  if (!userId) {
    ctx.status = StatusCodes.NOT_FOUND;
    ctx.body = {};
  }

  ctx.status = StatusCodes.OK;
  ctx.body = await getRequests(userId, false);
};

const getRequestMinified = async (ctx: Context) => {
  let data = {};
  try {
    const requests = await Request.find().exec();
    if (!requests) {
      ctx.status = StatusCodes.NOT_FOUND;
      ctx.body = {};
      return;
    }

    await Promise.all(
      requests.map(async (request, _i) => {
        if (!request.requestId) {
          return;
        }

        data[request.requestId] = {
          title: request.title,
          requestId: request.requestId,
          type: request.type,
          thumb: request.thumb,
          imdb_id: request.imdb_id,
          tmdb_id: request.tmdb_id,
          tvdb_id: request.tvdb_id,
          users: request.users,
          sonarrId: request.sonarrId,
          radarrId: request.radarrId,
          approved: request.approved,
          defaults: request.pendingDefault,
        };
        if (request.type === 'tv') {
          data[request.requestId].seasons = request.seasons;
        }
      }),
    );
  } catch (err) {
    logger.log('error', `ROUTE: Error getting requests`);
    logger.log({ level: 'error', message: err });
  }

  ctx.status = StatusCodes.OK;
  ctx.body = data;
};

const addRequest = async (ctx: Context) => {
  const body = ctx.request.body;

  let request = body.request;
  let process = await new processRequest(request, ctx.state.user).new();

  ctx.status = StatusCodes.OK;
  ctx.body = process;
};

const removeRequest = async (ctx: Context) => {
  const body = ctx.request.body;

  let request = body.request;
  let reason = body.reason;
  let process = new processRequest(request, ctx.state.user);

  await process.archive(false, true, reason);

  process.removeFromDVR();

  let emails: any = [];
  let titles: any = [];

  await Promise.all(
    request.users.map(async (user) => {
      let userData = await UserModel.findOne({ id: user }).exec();
      if (!userData) {
        ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
        ctx.body = { error: 'failed to find requests by user' };
        return;
      }

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
  const body = ctx.request.body;

  let request = body.request;
  let servers = body.servers;
  let approved = body.request.approved;
  let manualStatus = body.request.manualStatus;

  if (manualStatus === '5') {
    new processRequest(request, ctx.state.user).archive(true, false, false);
    ctx.status = StatusCodes.OK;
    ctx.body = {};
    return;
  }

  try {
    const instances = await GetAllDownloaders();
    await Request.findOneAndUpdate(
      { requestId: request.requestId },
      {
        $set: {
          approved: true,
          manualStatus: manualStatus,
        },
      },
      { new: true, useFindAndModify: false },
    ).exec();

    if (servers && servers.length) {
      const activeServers: IDownloader[] = servers.map((s) => {
        if (s.active) {
          const instance = instances.find((i) => i.id === s.id);
          if (instance) {
            return instance;
          }
        }
      });

      await Bluebird.map(activeServers, async (instance) => {
        if (request.type === 'movie') {
          await new Radarr(instance).processRequest(request.requestId);
        } else {
          await new Sonarr(instance).addShow(request, {
            profile: instance.profile,
            path: instance.path,
          });
        }
      });
    }

    if (!approved) {
      let emails: any = [];
      let titles: any = [];
      await Promise.all(
        request.users.map(async (id) => {
          let userData = await UserModel.findOne({ id }).exec();
          if (!userData) return;
          emails.push(userData.email);
          titles.push(userData.title);
        }),
      );
      const requestData = request;
      let type = requestData.type === 'tv' ? 'TV Show' : 'Movie';
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
    logger.log('error', `ROUTE: Error updating requests`);
    logger.log({ level: 'error', message: err });

    ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
    ctx.body = {};
  }
};

const getArchivedRequestById = async (ctx: Context) => {
  const id = ctx.params.id;

  ctx.status = StatusCodes.OK;
  ctx.body = await getArchive(id);
};
