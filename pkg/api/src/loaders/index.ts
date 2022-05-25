import Koa from 'koa';

import agendaFactory from './agenda';
import config from './config';
import jobs from './jobs';
import appRouter from './koa';
import mongoose from './mongoose';

export default async ({ httpApp }: { httpApp: Koa }) => {
  // load the config if the file exists, else use defaults
  const exists = await config();

  if (exists) {
    // load database
    const mongoConnection = await mongoose();

    // load agenda
    const agenda = agendaFactory({ mongoConnection });

    // load jobs
    jobs({ agenda: agenda });
  }

  // load express routing
  appRouter({ app: httpApp });
};
