import Router from '@koa/router';
import Koa from 'koa';
import jwt from 'koa-jwt';

import setupMiddleware from '@/api/middleware/setup';
import { config as conf } from '@/config/index';
import { removeSlashes } from '@/util/urls';

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
import web from './routes/web';

const app = new Koa();

export default (): Koa => {
  // make sure setup is complete before allowing access to non setup routes
  app.use(setupMiddleware);

  // web
  web(app);

  let subpath = removeSlashes(conf.get('petio.subpath'));
  if (subpath !== '') {
    subpath = '/' + subpath;
  }

  // v1 api router
  const v1 = new Router({
    prefix: '/api',
  });
  v1.use(
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

  // api v1 routes
  health(v1);
  batch(v1);
  config(v1);
  discovery(v1);
  filter(v1);
  history(v1);
  issue(v1);
  log(v1);
  login(v1);
  mail(v1);
  movie(v1);
  notifications(v1);
  person(v1);
  plex(v1);
  profiles(v1);
  request(v1);
  review(v1);
  search(v1);
  services(v1);
  sessions(v1);
  setup(v1);
  show(v1);
  top(v1);
  trending(v1);
  user(v1);

  app.use(v1.routes());
  app.use(v1.allowedMethods());

  return app;
};
