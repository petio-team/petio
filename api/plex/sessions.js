const request = require('xhr-request');

// Config
const getConfig = require('../util/config');

function getSessions() {
	const prefs = getConfig();
	return new Promise((resolve, reject) => {
		let url = `${prefs.plexProtocol}://${prefs.plexIp}:${prefs.plexPort}/status/sessions?X-Plex-Token=${prefs.plexToken}`;
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

module.exports = getSessions;
