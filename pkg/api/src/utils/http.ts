import koa from 'koa';

import { config } from '@/config/schema';
import { setupWorkerProcesses } from '@/services/cluster/setup';

export const listen = ({ httpApp }: { httpApp: koa }) => {
  // run server
  let http = httpApp.listen(config.get('petio.port'), config.get('petio.host'));

  httpApp.context.reload = async () => {
    if (http != null) {
      http.close();
    }
    setupWorkerProcesses();
  };
};
