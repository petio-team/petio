const request = require('xhr-request');
const Request = require('../models/request');
const fs = require('fs');
const path = require('path');
var sanitize = require('sanitize-filename');

class Radarr {
	constructor() {
		let project_folder, configFile;
		if (process.pkg) {
			project_folder = path.dirname(process.execPath);
			configFile = path.join(project_folder, './config/radarr.json');
		} else {
			project_folder = __dirname;
			configFile = path.join(project_folder, '../config/radarr.json');
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
			console.log('SERVICE - RADARR: Radarr not enabled');
			return false;
		}
		try {
			let check = await this.get('system/status');
			if (check.error) {
				console.log('SERVICE - RADARR: ERR Connection failed');
				return false;
			}
			if (check) {
				console.log('SERVICE - RADARR: Radarr connection success');
				return true;
			} else {
				console.log('SERVICE - RADARR: ERR Connection failed');
				return false;
			}
		} catch (err) {
			console.log('SERVICE - RADARR: ERR Connection failed');
			return false;
		}
	}

	async getPaths() {
		return await this.get('rootfolder');
	}

	async getProfiles() {
		return await this.get('profile');
	}

	lookup(id) {
		return this.get('movie/lookup/tmdb', {
			tmdbId: id,
		});
	}

	async movie(id) {
		const active = await this.connect();
		if (!active) {
			return false;
		}
		return this.get(`movie/${id}`);
	}

	async test() {
		return await this.connect(true);
	}

	async add(movieData) {
		movieData.ProfileId = this.config.profileId;
		movieData.Path = `${this.config.rootPath}${sanitize(
			movieData.title
		)} (${movieData.year})`;
		movieData.addOptions = {
			searchForMovie: true,
		};
		movieData.monitored = true;

		try {
			let add = await this.post('movie', false, movieData);
			console.log(add);
			return add.id;
		} catch (err) {
			console.log(`SERVICE - RADARR: Unable to add movie ${err}`);
			return false;
		}
	}

	async processJobs(jobQ) {
		for (let job of jobQ) {
			try {
				let radarrData = await this.lookup(job.tmdb_id);
				let radarrId = await this.add(radarrData);
				let updatedRequest = await Request.findOneAndUpdate(
					{
						_id: job._id,
					},
					{
						$set: {
							radarrId: radarrId,
						},
					},
					{ useFindAndModify: false }
				);
				if (updatedRequest) {
					console.log(
						`SERVICE - RADARR: Radarr job added for ${job.title}`
					);
				}
			} catch (err) {
				console.log(err);
				console.log(
					`SERVICE - RADARR: Unable to add movie ${job.title}`
				);
			}
		}
	}

	async getRequests() {
		console.log(`SERVICE - RADARR: Polling requests`);
		const active = await this.connect();
		if (!active) {
			console.log(`SERVICE - RADARR: Connection Failed Stopping Poll`);
			return;
		}
		const requests = await Request.find();
		let jobQ = [];
		for (let req of requests) {
			if (req.type === 'movie') {
				if (!req.tmdb_id) {
					console.log(
						`SERVICE - RADARR: TMDB ID not found for ${req.title}`
					);
				} else if (!req.radarrId) {
					jobQ.push(req);
					console.log(
						`SERVICE - RADARR: ${req.title} added to job queue`
					);
				}
			}
		}
		this.processJobs(jobQ);
	}
}

module.exports = Radarr;
