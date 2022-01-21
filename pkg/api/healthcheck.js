const fetch = require('node-fetch');

const logger = require("./app/logger");
const { conf } = require('./app/config');

const url = new URL(`/health`, `http://${conf.get('petio.host')}:${conf.get('petio.port')}${conf.get('petio.subpath')}`);

const healthCheck = async () => {
    const res = await fetch(url.toString());
    if (res.status == 200) {
        console.log("Health Check: Healthy");
        process.exit(0);
    } else {
        console.log("Health Check: Bad");
        process.exit(1);
    }
};

(async () => {
    try {
        await healthCheck();
    } catch (err) {
        logger.debug(err);
        process.exit(1);
    }
})();