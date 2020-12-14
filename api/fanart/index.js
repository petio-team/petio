// Config
const getConfig = require('../util/config');

const request = require('xhr-request');

async function fanart(id, type) {
	const config = getConfig();
	const fanartApi = config.fanartApi;
	let url = `https://webservice.fanart.tv/v3/${type}/${id}?api_key=${fanartApi}`;
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
