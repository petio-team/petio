import express from "express";
import logger from "../app/logger";

// Routes
import movieRoute from "./movie";
import showRoute from "./show";
import searchRoute from "./search";
import personRoute from "./person";
import loginRoute from "./login";
import trendingRoute from "./trending";
import requestRoute from "./request";
import topRoute from "./top";
import historyRoute from "./history";
import plexRoute from "./plex";
import reviewRoute from "./review";
import userRoute from "./user";
import genieRoute from "./genie";
import sessionsRoute from "./sessions";
import servicesRoute from "./services";
import mailRoute from "./mail";
import issueRoute from "./issue";
import profileRoute from "./profiles";
import configRoute from "./config";
import logsRoute from "./log";
import filterRoute from "./filter";
import discoveryRoute from "./discovery";
import notificationsRoute from "./notifications";
import batchRoute from "./batch";
import setupRoute from "./setup";
import { authRequired } from "../middleware/auth";
import { conf, hasConfig } from "../app/config";
import setupReady from "../util/setupReady";

const router = express.Router();
router.get("/config", async (req, res) => {
  const configStatus = hasConfig();
  let ready = false;
  if (configStatus !== false) {
    try {
      let setupCheck = await setupReady();
      if (setupCheck.ready) {
        ready = true;
      }
      if (setupCheck.error) {
        res.status(500).json({
          error: "An error has occured",
        });
        return;
      }
    } catch {
      res.status(500).json({
        error: "An error has occured",
      });
      return;
    }
  }
  res.json({
    config: configStatus === false ? false : true,
    login_type: conf.get("auth.type"),
    ready: ready,
  });
});

router.use("/login", loginRoute);
router.use("/setup", setupRoute);
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

router.use((req, res, next) => {
  if (req.path !== "/logs/stream")
    logger.log("verbose", `API: Route ${req.path}`);
  next();
});

export default router;
