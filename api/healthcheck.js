const axios = require('axios').default;

const logger = require("./util/logger");
const { conf } = require('./util/config');

const url = new URL(`http://${conf.get('petio.host')}:${conf.get('petio.port')}${conf.get('petio.subpath')}`);

axios({
    url: '/health',
    method: 'get',
    timeout: 2000,
});

const healthCheck = () => {
    return axios.get(url.toString()).then(res => {
        logger.debug(`Health Check: ${res.status}`);
        if (res.status != 200) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    }).catch((err) => {
        logger.debug(err);
        logger.debug("health check failed");
        process.exit(1);
    });
};

try {
    healthCheck();
} catch (err) {
    logger.debug(err);
    process.exit(1);
}