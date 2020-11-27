const request = require('xhr-request');
const plexLookup = require('../plex/plexLookup');

// Config
const user_config = require('../util/config');
if (!user_config) {
	return;
}
const prefs = JSON.parse(user_config);

function getHistory(id, type) {
	return new Promise((resolve, reject) => {
		let d = new Date();
		d.setMonth(d.getMonth() - 1);
		d.setHours(0, 0, 0);
		d.setMilliseconds(0);
		let timestamp = (d / 1000) | 0;
		let url = `http://${prefs.plexIp}:${prefs.plexPort}/status/sessions/history/all?sort=viewedAt%3Adesc&accountID=${id}&viewedAt>=${timestamp}&limit=20&X-Plex-Token=${prefs.plexToken}`;
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
				resolve(parseHistory(data, type));
			}
		);
	});
}

async function parseHistory(data, type) {
	if (type === 'show') {
		type = 'episode';
	}
	let history = data.MediaContainer.Metadata;
	let output = {};
	if (!history) {
		return output;
	}
	let histArr = new Array();
	for (let i = 0; i < history.length; i++) {
		let item = history[i];
		if (type === item.type) {
			let media_type = item.type;
			let media_id = item.ratingKey;
			let media_title = item.title;

			if (type === 'episode' && item.grandparentKey) {
				media_id = item.grandparentKey.replace(
					'/library/metadata/',
					''
				);
				media_title = item.grandparentTitle;
			} else if (type === 'episode' && item.parentKey) {
				media_id = item.parentKey.replace('/library/metadata/', '');
			}

			let key = media_id;

			if (!histArr.includes(key)) {
				if (type === 'episode') {
					let plexData = await plexLookup(media_id, 'show');
					media_id = plexData.tmdb_id;
				} else {
					let plexData = await plexLookup(media_id, 'movie');
					media_id = plexData.tmdb_id;
				}

				histArr.push(key);

				if (media_type === type) {
					output[i] = {
						id: media_id,
						name: media_title,
					};
				}
			}
		}
	}
	return output;
}

module.exports = getHistory;
