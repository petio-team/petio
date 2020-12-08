const request = require('xhr-request');

class Sonarr {
	constructor() {
		this.config = {
			protocol: 'http',
			hostname: '10.10.0.10',
			apiKey: 'e2593a3f2ed74722b4b2e412072af436',
			port: 8989,
			urlBase: '',
		};
	}

	process(method, endpoint, params, body = false) {
		return new Promise((resolve, reject) => {
			if (!params) {
				params = {};
			}
			params.apikey = this.config.apiKey;
			let paramsString = '';
			Object.keys(params).map((val, i) => {
				let key = val;
				paramsString += `${i === 0 ? '?' : '&'}${key}=${params[val]}`;
			});
			let url = `${this.config.protocol}://${this.config.hostname}${
				this.config.port ? ':' + this.config.port : ''
			}${this.config.urlBase}/api/${endpoint}${paramsString}`;
			console.log(url);
			let args = {
				method: method,
				json: true,
			};
			if (method === 'post' && body) {
				args = {
					method: method,
					json: true,
					body: body,
				};
			}
			request(url, args, function (err, data) {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
	}

	async get(endpoint, params = false) {
		return this.process('get', endpoint, params);
	}

	async post(endpoint, params = false, body = {}) {
		return this.process('post', endpoint, params, body);
	}

	async connect() {
		try {
			let check = await this.get('system/status');
			if (check) {
				console.log('Sonarr connection success');
				return true;
			} else {
				return false;
			}
		} catch (err) {
			console.log(err);
			return false;
		}
	}

	getProfiles() {
		return this.get('profile');
	}

	refresh(id) {
		return this.post('command', false, {
			name: 'refreshSeries',
			seriesId: id,
		});
	}

	async getRequests() {
		let config = await this.connect();
		console.log(config);
		if (config) {
			let profiles = await this.getProfiles();
			let seriesLookup = await this.get('series/lookup', {
				term: 'tvdb:366625',
			});
			let seriesData = seriesLookup[0];
			seriesData.ProfileId = 1;
			seriesData.Path = `H:\\TV\\${seriesData.title}`;
			seriesData.addOptions = {
				searchForMissingEpisodes: true,
			};
			let add = await this.post('series', false, seriesData);
			console.log(add);
		}
	}
}

module.exports = Sonarr;
