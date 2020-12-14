const request = require('xhr-request');
const plexLookup = require('../plex/plexLookup');

// Config
const getConfig = require('../util/config');

function getTop(type) {
	const prefs = getConfig();
	return new Promise((resolve, reject) => {
		let d = new Date();
		d.setMonth(d.getMonth() - 1);
		d.setHours(0, 0, 0);
		d.setMilliseconds(0);
		let timestamp = (d / 1000) | 0;
		let url = `${prefs.plexProtocol}://${prefs.plexIp}:${prefs.plexPort}/library/all/top?type=${type}&viewedAt>=${timestamp}&limit=20&X-Plex-Token=${prefs.plexToken}`;
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
				resolve(parseTop(data, type));
			}
		);
	});
}

async function parseTop(data, type) {
	let top = data.MediaContainer.Metadata;
	let output = {};
	for (let i = 0; i < top.length; i++) {
		let item = top[i];
		let ratingKey = item.ratingKey;
		let globalViewCount = item.globalViewCount;
		let userCount = item.userCount;
		let plexData = false;
		if (type === 2) {
			plexData = await plexLookup(ratingKey, 'show');
		} else {
			plexData = await plexLookup(ratingKey, 'movie');
		}
		output[item.ratingKey] = {
			item: {
				tmdb_id: plexData.tmdb_id,
			},
			globalViewCount: globalViewCount,
			userCount: userCount,
		};
	}
	return output;
}

module.exports = getTop;
