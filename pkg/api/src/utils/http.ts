import koa from 'koa';

import config from '@/config/schema';

export default ({ httpApp, reloadFn }: { httpApp: koa, reloadFn: () => Promise<void> }) => {
  // run server
  const http = httpApp.listen(config.get('petio.port'), config.get('petio.host'));
  // eslint-disable-next-line no-param-reassign
  httpApp.context.reload = async () => {
    if (http != null) {
      http.close();
    }
    await reloadFn();
  };
};
