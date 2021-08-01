import { Request, Response, Router } from "express";

import { authRequired } from "../middleware/auth";
import batchRoute from "./batch";
import configRoute from "./config";
import discoveryRoute from "./discovery";
import filterRoute from "./filter";
import genieRoute from "./genie";
import historyRoute from "./history";
import issueRoute from "./issue";
import loginRoute from "./login";
import logsRoute from "./log";
import mailRoute from "./mail";
import movieRoute from "./movie";
import notificationsRoute from "./notifications";
import personRoute from "./person";
import plexRoute from "./plex";
import profileRoute from "./profiles";
import requestRoute from "./request";
import reviewRoute from "./review";
import searchRoute from "./search";
import servicesRoute from "./services";
import sessionsRoute from "./sessions";
import showRoute from "./show";
import topRoute from "./top";
import trendingRoute from "./trending";
import userRoute from "./user";

const router = Router();

router.use("/", async (req: Request, res: Response) => {
  res.status(200).json({ message: "Petio's API" });
});
router.use("/login", loginRoute);
router.use("/movie", authRequired, movieRoute);
router.use("/show", authRequired, showRoute);
router.use("/person", authRequired, personRoute);
router.use("/search", authRequired, searchRoute);
router.use("/trending", authRequired, trendingRoute);
router.use("/request", authRequired, requestRoute);
router.use("/top", authRequired, topRoute);
router.use("/history", authRequired, historyRoute);
router.use("/plex", authRequired, plexRoute);
router.use("/review", authRequired, reviewRoute);
router.use("/user", userRoute);
router.use("/genie", authRequired, genieRoute);
router.use("/sessions", authRequired, sessionsRoute);
router.use("/services", authRequired, servicesRoute);
router.use("/mail", authRequired, mailRoute);
router.use("/issue", authRequired, issueRoute);
router.use("/profiles", authRequired, profileRoute);
router.use("/config", authRequired, configRoute);
router.use("/logs", authRequired, logsRoute);
router.use("/filter", authRequired, filterRoute);
router.use("/discovery", authRequired, discoveryRoute);
router.use("/hooks", authRequired, notificationsRoute);
router.use("/batch", authRequired, batchRoute);

export default router;
