const mongoose = require("mongoose");
const numCPUs = require("os").cpus().length;
const cluster = require("cluster");

const logger = require("./logger");
const { conf } = require("./config");
const { SetupRouter } = require("../router");
const trending = require("../tmdb/trending");
const version = require("../package.json").version;

let server = null;

const app = () => {
    logger.info(`Petio - v${version}`);
    try {
        // check the num of cpu cores
        if (numCPUs < 2) {
            logger.warn(
                "You have less then the recommended logical cores (2 cores) available, performance will be affected"
            );
        }

        // setup the core of the router
        server = SetupRouter(restart);

        if (conf.get('admin.id') != null) {
            // load db
            connect();
            // pull tending data
            trending();
        }

        // fork process for worker to run on
        cluster.fork();

    } catch (e) {
        logger.error(e);
        process.exit(0);
    }

    logger.info("Listening on: " + conf.get('petio.host') + ":" + conf.get('petio.port'));

    // check if admin id is set else we tell the user they need to go through setup
    if (conf.get('admin.id') == null) {
        logger.warn("Initial setup is required, please proceed to the webui to begin the setup");
    }
};

const restart = () => {
    if (server != null) {
        server.close();
    }
    app();
};

const connect = async () => {
    try {
        mongoose.connect(conf.get('db.url'), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (err) {
        logger.error("Error connecting to database");
        logger.error(err);
    }
};

module.exports = app;