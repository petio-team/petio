import { Application } from "express";

import agendaFactory from "./agenda";
import appRouter from "./express";
import mongoose from "./mongoose";
import jobs from "./jobs";
import config from "./config";

export default async ({ expressApp }: { expressApp: Application }) => {
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
  appRouter({ app: expressApp });
};
