const SonarrAPI = require('sonarr-api');

class Sonarr {
	constructor() {
		this.connection = this.connect();
	}

	async connect() {
		try {
			let con = new SonarrAPI({
				hostname: '10.10.0.10',
				apiKey: 'e2593a3f2ed74722b4b2e412072af436',
				port: 8989,
				urlBase: '',
			});
			await con.get('system/status');
			console.log('Sonarr config ok');
			return true;
		} catch (err) {
			console.log('Sonarr connection error');
			return false;
		}
	}

	// async add() {
	// 	if (this.connection) {
	// 		console.log('all good');
	// 	}
	// }

	async getRequests() {
		if (this.connection) {
			console.log('sonarr would poll here');
		}
	}
}

module.exports = Sonarr;
