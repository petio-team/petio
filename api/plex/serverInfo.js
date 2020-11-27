const request = require('xhr-request');

// Config
const user_config = require('../util/config');
if (!user_config) {
	return;
}
const prefs = JSON.parse(user_config);

function getServerInfo() {
	return new Promise((resolve, reject) => {
		let url = `http://${prefs.plexIp}:${prefs.plexPort}/statistics/resources?timespan=6&X-Plex-Token=${prefs.plexToken}`;
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

module.exports = getServerInfo;
