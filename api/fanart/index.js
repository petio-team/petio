// Config
const user_config = require('../util/config');
if (!user_config) {
	return;
}
const prefs = JSON.parse(user_config);

const request = require('xhr-request');

async function fanart(id, type) {
	let url = `https://webservice.fanart.tv/v3/${type}/${id}?api_key=${prefs.fanartApi}`;
	return new Promise((resolve, reject) => {
		request(
			url,
			{
				method: 'GET',
				json: true,
			},
			function (err, data) {
				if (err) {
					reject();
				}
				// console.log(data);
				resolve(data);
			}
		);
	});
}

module.exports = fanart;
