const express = require("express");
const router = express.Router();
const logger = require("../util/logger");

// Routes
const movieRoute = require("./movie");
const showRoute = require("./show");
const searchRoute = require("./search");
const personRoute = require("./person");
const loginRoute = require("./login");
const trendingRoute = require("./trending");
const requestRoute = require("./request");
const topRoute = require("./top");
const historyRoute = require("./history");
const plexRoute = require("./plex");
const reviewRoute = require("./review");
const userRoute = require("./user");
const genieRoute = require("./genie");
const sessionsRoute = require("./sessions");
const servicesRoute = require("./services");
const mailRoute = require("./mail");
const issueRoute = require("./issue");
const profileRoute = require("./profiles");
const configRoute = require("./config");
const logsRoute = require("./log");
const filterRoute = require("./filter");
const discoveryRoute = require("./discovery");
const notificationsRoute = require("./notifications");
const batchRoute = require("./batch");
const setupRoute = require("./setup");
const { authRequired } = require("../middleware/auth");
const { conf } = require("../util/config");
const setupReady = require("../util/setupReady");

router.get("/config", async (req, res) => {
    let ready = false;
    if (conf.get('admin.id') != null) {
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
    res.json(
        {
            config: conf.get('admin.id') == null ? false : true,
            login_type: conf.get('auth.type'),
            ready: ready
        }
    );
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

module.exports = router;