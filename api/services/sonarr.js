const request = require('xhr-request');
const Request = require('../models/request');
const fs = require('fs');
const path = require('path');
var sanitize = require('sanitize-filename');

class Sonarr {
	constructor() {
		let project_folder, configFile;
		if (process.pkg) {
			project_folder = path.dirname(process.execPath);
			configFile = path.join(project_folder, './config/sonarr.json');
		} else {
			project_folder = __dirname;
			configFile = path.join(project_folder, '../config/sonarr.json');
		}
		const configData = fs.readFileSync(configFile);
		const configParse = JSON.parse(configData);
		this.config = configParse;
	}

	process(method, endpoint, params, body = false) {
		return new Promise((resolve, reject) => {
			if (!this.config.hostname) {
				reject('');
				return;
			}
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

	getConfig() {
		return this.config;
	}

	async get(endpoint, params = false) {
		return this.process('get', endpoint, params);
	}

	async post(endpoint, params = false, body = {}) {
		return this.process('post', endpoint, params, body);
	}

	async connect(test = false) {
		if (!this.config.enabled && !test) {
			console.log('SERVICE - SONARR: Sonarr not enabled');
			return false;
		}
		try {
			let check = await this.get('system/status');
			if (check.error) {
				console.log('SERVICE - SONARR: ERR Connection failed');
				return false;
			}
			if (check) {
				console.log('SERVICE - SONARR: Sonarr connection success');
				return true;
			} else {
				console.log('SERVICE - SONARR: ERR Connection failed');
				return false;
			}
		} catch (err) {
			console.log('SERVICE - SONARR: ERR Connection failed');
			return false;
		}
	}

	async getPaths() {
		return await this.get('rootfolder');
	}

	async getProfiles() {
		return await this.get('profile');
	}

	refresh(id) {
		return this.post('command', false, {
			name: 'refreshSeries',
			seriesId: id,
		});
	}

	lookup(id) {
		return this.get('series/lookup', {
			term: `tvdb:${id}`,
		});
	}

	async series(id) {
		const active = await this.connect();
		if (!active) {
			return false;
		}
		return this.get(`series/${id}`);
	}

	async test() {
		return await this.connect(true);
	}

	async add(seriesData) {
		seriesData.ProfileId = this.config.profileId;
		seriesData.Path = `${this.config.rootPath}${sanitize(
			seriesData.title
		)} (${seriesData.year})`;
		seriesData.addOptions = {
			searchForMissingEpisodes: true,
		};

		try {
			let add = await this.post('series', false, seriesData);
			console.log(add);
			return add.id;
		} catch (err) {
			console.log(err);
			console.log(`SERVICE - SONARR: Unable to add series ${err}`);
			return false;
		}
	}

	async processJobs(jobQ) {
		for (let job of jobQ) {
			try {
				let sonarrData = await this.lookup(job.tvdb_id);
				let sonarrId = await this.add(sonarrData[0]);
				let updatedRequest = await Request.findOneAndUpdate(
					{
						_id: job._id,
					},
					{
						$set: {
							sonarrId: sonarrId,
						},
					},
					{ useFindAndModify: false }
				);
				if (updatedRequest) {
					console.log(
						`SERVICE - SONARR: Sonnar job added for ${job.title}`
					);
				}
			} catch (err) {
				console.log(
					`SERVICE - SONARR: Unable to add series ${job.title}`
				);
			}
		}
	}

	async getRequests() {
		console.log(`SERVICE - SONARR: Polling requests`);
		const active = await this.connect();
		if (!active) {
			console.log(`SERVICE - SONARR: Connection Failed Stopping Poll`);
			return;
		}
		const requests = await Request.find();
		let jobQ = [];
		for (let req of requests) {
			if (req.type === 'tv') {
				if (!req.tvdb_id) {
					console.log(
						`SERVICE - SONARR: TVDB ID not found for ${req.title}`
					);
				} else if (!req.sonarrId) {
					jobQ.push(req);
					console.log(
						`SERVICE - SONARR: ${req.title} added to job queue`
					);
				}
			}
		}
		this.processJobs(jobQ);
	}
}

module.exports = Sonarr;
