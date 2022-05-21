import { Router } from "express";

import batch from "./routes/batch";
import config from "./routes/config";
import discovery from "./routes/discovery";
import filter from "./routes/filter";
import history from "./routes/history";
import issue from "./routes/issue";
import log from "./routes/log";
import login from "./routes/login";
import mail from "./routes/mail";
import movie from "./routes/movie";
import notifications from "./routes/notifications";
import person from "./routes/person";
import plex from "./routes/plex";
import profiles from "./routes/profiles";
import request from "./routes/request";
import review from "./routes/review";
import search from "./routes/search";
import services from "./routes/services";
import sessions from "./routes/sessions";
import setup from "./routes/setup";
import show from "./routes/show";
import top from "./routes/top";
import trending from "./routes/trending";
import user from "./routes/user";
import web from "./routes/web";

import setupMiddleware from "@/api/middleware/setup";

// api version 1 router
const v1 = Router();

export default () => {
  const app = Router();

  // web
  web(app);

  // v1 api router
  app.use("/api", v1);
  app.use(setupMiddleware);

  // api v1 routes
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

  return app;
};
