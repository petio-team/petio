import { Application } from "express";

import agendaFactory from "./agenda";
import appRouter from "./express";
import mongoose from "./mongoose";
import jobs from "./jobs";
import { hasConfig, loadConfig } from "@/app/config";

export default async ({ expressApp }: { expressApp: Application }) => {
  // load the config if the file exists, else use defaults
  loadConfig();

  if (hasConfig()) {
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
