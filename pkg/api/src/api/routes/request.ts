import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';

import Radarr from '@/downloaders/radarr';
import Sonarr from '@/downloaders/sonarr';
import logger from '@/loaders/logger';
import Mailer from '@/mail/mailer';
import Request from '@/models/request';
import { UserModel } from '@/models/user';
import { getArchive } from '@/requests/archive';
import { getRequests } from '@/requests/display';
import processRequest from '@/requests/process';

const route = new Router({ prefix: '/request' });

export default (app: Router) => {
  route.get('/all', listRequests);
  route.get('/min', getRequestMinified);
  route.post('/add', addRequest);
  route.get('/me', getUserRequests);
  route.post('/remove', removeRequest);
  route.post('/update', updateRequest);
  route.get('/archive/:id', getArchivedRequestById);

  app.use(route.routes());
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
  const requests = await Request.find();
  let data = {};
  try {
    data = {};

    await Promise.all(
      requests.map(async (request, i) => {
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
  const body = ctx.body as any;

  let user = body.user;
  let request = body.request;
  let process = await new processRequest(request, user).new();

  ctx.status = StatusCodes.OK;
  ctx.body = process;
};

const removeRequest = async (ctx: Context) => {
  const body = ctx.body as any;

  let request = body.request;
  let reason = body.reason;
  let process = new processRequest(request);

  await process.archive(false, true, reason);

  process.removeFromDVR();

  let emails: any = [];
  let titles: any = [];

  await Promise.all(
    request.users.map(async (user) => {
      let userData = await UserModel.findOne({ id: user });
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
  const body = ctx.body as any;

  let request = body.request;
  let servers = body.servers;
  let approved = body.request.approved;
  let manualStatus = body.request.manualStatus;

  if (manualStatus === '5') {
    new processRequest(request, false).archive(true, false, false);

    ctx.status = StatusCodes.OK;
    ctx.body = {};
    return;
  }

  try {
    await Request.findOneAndUpdate(
      { requestId: request.requestId },
      {
        $set: {
          approved: true,
          manualStatus: manualStatus,
        },
      },
      { new: true, useFindAndModify: false },
    );

    if (servers && request.type === 'movie') {
      await Promise.all(
        Object.keys(servers).map(async (r) => {
          let active = servers[r].active;
          if (active) {
            await new Radarr(
              r,
              false,
              servers[r].profile,
              servers[r].path,
            ).processRequest(request.requestId);
          }
        }),
      );
    }

    if (servers && request.type === 'tv') {
      await Promise.all(
        Object.keys(servers).map(async (s) => {
          let active = servers[s].active;
          request.id = request.requestId;
          if (active) {
            await new Sonarr().addShow({ id: s }, request, {
              profile: servers[s].profile,
              path: servers[s].path,
            });
          }
        }),
      );
    }

    if (!approved) {
      let emails: any = [];
      let titles: any = [];
      await Promise.all(
        request.users.map(async (id) => {
          let userData = await UserModel.findOne({ id });
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
