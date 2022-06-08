import Router from '@koa/router';
import Koa from 'koa';
import jwt from 'koa-jwt';

import batch from '@/api/routes/api/batch';
import config from '@/api/routes/api/config';
import discovery from '@/api/routes/api/discovery';
import filter from '@/api/routes/api/filter';
import health from '@/api/routes/api/health';
import history from '@/api/routes/api/history';
import issue from '@/api/routes/api/issue';
import log from '@/api/routes/api/log';
import login from '@/api/routes/api/login';
import mail from '@/api/routes/api/mail';
import movie from '@/api/routes/api/movie';
import notifications from '@/api/routes/api/notifications';
import person from '@/api/routes/api/person';
import plex from '@/api/routes/api/plex';
import profiles from '@/api/routes/api/profiles';
import request from '@/api/routes/api/request';
import review from '@/api/routes/api/review';
import search from '@/api/routes/api/search';
import services from '@/api/routes/api/services';
import sessions from '@/api/routes/api/sessions';
import setup from '@/api/routes/api/setup';
import show from '@/api/routes/api/show';
import top from '@/api/routes/api/top';
import trending from '@/api/routes/api/trending';
import user from '@/api/routes/api/user';
import { config as conf } from '@/config/index';

export default (app: Koa, subpath: string) => {
  // api router
  const api = new Router({
    prefix: '/api',
  });

  if (subpath === '/') {
    subpath = '';
  }

  api.use(
    jwt({
      secret: conf.get('plex.token'),
      cookie: 'petio_jwt',
      debug: true,
    }).unless({
      path: [
        subpath + '/api/health',
        subpath + '/api/config',
        subpath + '/api/login',
        subpath + '/api/login/plex_login',
        subpath + '/api/setup',
        subpath + '/api/setup/test_server',
        subpath + '/api/setup/test_mongo',
        subpath + '/api/setup/set',
      ],
    }),
  );

  // api routes
  health(api);
  batch(api);
  config(api);
  discovery(api);
  filter(api);
  history(api);
  issue(api);
  log(api);
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
  setup(api);
  show(api);
  top(api);
  trending(api);
  user(api);

  app.use(api.routes());
  app.use(api.allowedMethods());
};