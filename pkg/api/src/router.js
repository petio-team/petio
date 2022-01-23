const express = require('express');
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

const apiRoutes = require("./routes/api");
const { conf } = require("./app/config");
const checkSetup = require('./middleware/setup');
const logger = require("./app/logger");
const { viewFolder } = require("./app/env");

// setups the core of the router
const SetupRouter = (restartFunc) => {
    const router = express();

    // setup the middleware that modify requests and responses
    router.use(
        cors({
            origin: (_, callback) => {
                callback(null, true);
            },
            credentials: true,
        })
    );
    router.use(express.json());
    router.use(express.urlencoded({ extended: true }));
    router.use(cookieParser());
    router.use(checkSetup);
    router.set("trust proxy", conf.get('petio.proxies'));
    router.set("restart", restartFunc);

    // setup the different routes
    routes(router);

    try {
        // listen on the address and port specified in the settings
        return router.listen(conf.get('petio.port'), conf.get('petio.host'));
    } catch (e) {
        logger.error(e);
        throw new Error('failed to bind server on \'' + conf.get('petio.host') + ':' + conf.get('petio.port') + '\'');
    }
};

// setup the core routes that our frontend, admin and api will use
const routes = (router) => {
    const baseRouter = express.Router();

    baseRouter.get("/health", (_, res) => {
        res.status(200).send(".");
    });
    baseRouter.use("/api", apiRoutes);
    baseRouter.use(express.static(path.resolve(viewFolder, './frontend/build')));

    const admin = express();
    baseRouter.use("/admin", admin);
    admin.use("/", express.static(path.resolve(viewFolder, './admin/build')));

    if (conf.get('petio.subpath') !== "/") {
        router.use(`${conf.get('petio.subpath')}`, baseRouter);
    } else {
        router.use(`/`, baseRouter);
    }
};

module.exports = {
    SetupRouter,
};