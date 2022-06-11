import Koa from 'koa';

import agendaFactory from '@/loaders/agenda';
import config from '@/loaders/config';
import jobs from '@/loaders/jobs';
import appRouter from '@/loaders/koa';
import mongoose from '@/loaders/mongoose';

import di from './di';

export default async ({ httpApp }: { httpApp: Koa }) => {
  // inject everything into di
  di();

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
