import Router from '@koa/router';
import Koa from 'koa';
import jwt from 'koa-jwt';

import { config as conf } from '@/config/index';

import batch from './routes/batch';
import config from './routes/config';
import discovery from './routes/discovery';
import filter from './routes/filter';
import health from './routes/health';
import history from './routes/history';
import issue from './routes/issue';
import log from './routes/log';
import login from './routes/login';
import mail from './routes/mail';
import movie from './routes/movie';
import notifications from './routes/notifications';
import person from './routes/person';
import plex from './routes/plex';
import profiles from './routes/profiles';
import request from './routes/request';
import review from './routes/review';
import search from './routes/search';
import services from './routes/services';
import sessions from './routes/sessions';
import setup from './routes/setup';
import show from './routes/show';
import top from './routes/top';
import trending from './routes/trending';
import user from './routes/user';

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
