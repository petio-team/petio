import koa from 'koa';
import session from 'koa-session';
import MongooseStore from 'koa-session-mongoose';

import logger from '@/loaders/logger';

const SESSION_CONFIG: Partial<session.opts> = {
  key: 'petio_sess',
  maxAge: 2630000, // one month
  secure: false,
  store: new MongooseStore({
    expires: 2630000,
  }),
};

export default (app: koa) => {
  app.on('session:missed', (err) => logger.debug(`session missed: ${err}`));
  app.on('session:invalid', (err) => logger.debug(`session invalid: ${err}`));
  app.on('session:expired', (err) => logger.debug(`session expired: ${err}`));

  return session(SESSION_CONFIG, app);
};
