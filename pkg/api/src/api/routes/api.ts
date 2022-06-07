import Router from '@koa/router';
import Koa from 'koa';
import jwt from 'koa-jwt';

import { config as conf } from '@/config/index';

import batch from './api/batch';
import config from './api/config';
import discovery from './api/discovery';
import filter from './api/filter';
import health from './api/health';
import history from './api/history';
import issue from './api/issue';
import log from './api/log';
import login from './api/login';
import mail from './api/mail';
import movie from './api/movie';
import notifications from './api/notifications';
import person from './api/person';
import plex from './api/plex';
import profiles from './api/profiles';
import request from './api/request';
import review from './api/review';
import search from './api/search';
import services from './api/services';
import sessions from './api/sessions';
import setup from './api/setup';
import show from './api/show';
import top from './api/top';
import trending from './api/trending';
import user from './api/user';

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
