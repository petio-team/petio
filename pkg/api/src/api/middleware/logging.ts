import morgan from 'koa-morgan';

import Logger from '@/loaders/logger';

export default () =>
  morgan((tokens: any, req: any, res: any) => {
    const msg = [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
    ].join(' ');
    Logger.http(msg);
    return null;
  }, {});
