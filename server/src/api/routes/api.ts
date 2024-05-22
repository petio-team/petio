import Router from '@koa/router';
import Koa from 'koa';
import jwt from 'koa-jwt';

import batch from '@/api/routes/batch';
import config from '@/api/routes/config';
import discovery from '@/api/routes/discovery';
import filter from '@/api/routes/filter';
import health from '@/api/routes/health';
import history from '@/api/routes/history';
import issue from '@/api/routes/issue';
import login from '@/api/routes/login';
import mail from '@/api/routes/mail';
import movie from '@/api/routes/movie';
import notifications from '@/api/routes/notifications';
import person from '@/api/routes/person';
import plex from '@/api/routes/plex';
import profiles from '@/api/routes/profiles';
import request from '@/api/routes/request';
import review from '@/api/routes/review';
import search from '@/api/routes/search';
import services from '@/api/routes/services';
import sessions from '@/api/routes/sessions';
import setup from '@/api/routes/setup';
import show from '@/api/routes/show';
import top from '@/api/routes/top';
import trending from '@/api/routes/trending';
import user from '@/api/routes/user';
import { NODE_ENV } from '@/infrastructure/config/env';

const api = new Router({ prefix: '/api' });

export default (app: Koa, subpath: string, isSetup: boolean) => {
  let path = subpath;
  if (path === '/') {
    path = '';
  }

  health(api);
  config(api);

  if (isSetup) {
    setup(api);
  } else {
    // make sure setup is complete before allowing access to non setup routes
    api.use(
      jwt({
        // TODO: fix this and generate keys again
        secret: (app.keys as string[]) ?? [],
        cookie: 'petio_jwt',
        debug: NODE_ENV === 'development',
      }).unless({
        path: [
          `${path}/api/health`,
          `${path}/api/config`,
          `${path}/api/login`,
          `${path}/api/login/plex_login`,
          `${path}/api/setup`,
          `${path}/api/setup/test_server`,
          `${path}/api/setup/test_mongo`,
          `${path}/api/setup/set`,
        ],
      }),
    );

    batch(api);
    discovery(api);
    filter(api);
    history(api);
    issue(api);
    login(api);
    mail(api);
    movie(api);
    notifications(api);
    person(api);
    plex(api);
    profiles(api);
    request(api);
    review(api);
    search(api);
    services(api);
    sessions(api);
    show(api);
    top(api);
    trending(api);
    user(api);
  }

  app.use(api.routes());
  app.use(api.allowedMethods());
};
