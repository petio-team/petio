const { URL, URLSearchParams } = require('url');
const { conf } = require("../app/config");

const MakePlexURL = (url, params = {}) => {
    const baseurl = new URL(url, `${conf.get('plex.protocol')}://${conf.get('plex.host')}:${conf.get('plex.port')}`);
    const prms = new URLSearchParams();

    for (let key in params) {
        if (params.hasOwnProperty(key)) {
            prms.set(key, params[key]);
        }
    }

    prms.set('X-Plex-Token', conf.get('plex.token'));
    baseurl.search = prms.toString();

    return baseurl;
};

module.exports = MakePlexURL;