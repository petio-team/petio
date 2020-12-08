const request = require('xhr-request');
const plexLookup = require('../plex/plexLookup');

// Config
const user_config = require('../util/config');
if (!user_config) {
	return;
}
const prefs = JSON.parse(user_config);

function getBandwidth() {
	return new Promise((resolve, reject) => {
		let url = `${prefs.plexProtocol}://${prefs.plexIp}:${prefs.plexPort}/statistics/bandwidth?timespan=6&X-Plex-Token=${prefs.plexToken}`;
		request(
			url,
			{
				method: 'GET',
				json: true,
			},
			function (err, data) {
				if (err) {
					reject(err);
				}
				resolve(data);
			}
		);
	});
}

module.exports = getBandwidth;
