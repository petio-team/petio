const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const CronJob = require('cron').CronJob;
const fs = require('fs');
const path = require('path');

// Config
const getConfig = require('./util/config');

// Plex
const LibraryUpdate = require('./plex/libraryUpdate');

// Routes
const movieRoute = require('./routes/movie');
const showRoute = require('./routes/show');
const searchRoute = require('./routes/search');
const personRoute = require('./routes/person');
const loginRoute = require('./routes/login');
const trendingRoute = require('./routes/trending');
const requestRoute = require('./routes/request');
const topRoute = require('./routes/top');
const historyRoute = require('./routes/history');
const plexRoute = require('./routes/plex');
const reviewRoute = require('./routes/review');
const userRoute = require('./routes/user');
const genieRoute = require('./routes/genie');
const sessionsRoute = require('./routes/sessions');
// const setupRoute = require('./routes/setup');
const servicesRoute = require('./routes/services');
const mailRoute = require('./routes/mail');

class Main {
	constructor() {
		this.cron = new CronJob('0 */30 * * * *', function () {
			const d = new Date();
			console.log('Library Watch Running:', d);
			new LibraryUpdate().run();
		});
		this.createConfigDir(path.join(__dirname, './config'));
		this.config = getConfig();
		this.e = app;
		this.server = null;
		this.e.use(cors());
		this.e.options('*', cors());
		this.e.use(express.json());
		this.e.use(express.urlencoded({ extended: true }));
	}

	setRoutes() {
		console.log('Setting up routes');
		this.e.get('/config', async (req, res) => {
			res.json(this.config ? { config: true } : { config: false });
		});
		this.setup();
		if (this.config) {
			this.e.use('/login', loginRoute);
			this.e.use('/movie', movieRoute);
			this.e.use('/show', showRoute);
			this.e.use('/person', personRoute);
			this.e.use('/search', searchRoute);
			this.e.use('/trending', trendingRoute);
			this.e.use('/request', requestRoute);
			this.e.use('/top', topRoute);
			this.e.use('/history', historyRoute);
			this.e.use('/plex', plexRoute);
			this.e.use('/review', reviewRoute);
			this.e.use('/user', userRoute);
			this.e.use('/genie', genieRoute);
			this.e.use('/sessions', sessionsRoute);
			this.e.use('/services', servicesRoute);
			this.e.use('/mail', mailRoute);
		}
	}

	async restart() {
		console.log('Restarting server');
		this.cron.stop();
		await this.server.close();
		this.config = getConfig();
		this.init();
	}

	init() {
		this.setRoutes();
		console.log('Starting Server ');
		this.server = this.e.listen(7778);
		console.log('Listening on 7778');
		if (!this.config) {
			console.log('No config, entering setup mode');
		} else {
			// Routing
			console.log('Connecting to Database, please wait....');
			this.connectDb();
		}
	}

	async connectDb() {
		try {
			await mongoose.connect(this.config.DB_URL, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			});
			console.log('Connected to Database ');
			this.start();
		} catch (err) {
			console.log(err);
			console.log('Fatal error - database misconfigured!');
			console.log('Removing config please restart');
			fs.unlinkSync('./config/config.json');
		}
	}

	async start() {
		const libUpdate = new LibraryUpdate();
		this.cron.start();
		libUpdate.run();
	}

	setup() {
		this.e.post('/setup/set', async (req, res) => {
			if (this.config) {
				res.status(403).send('Config exists');
				console.log(
					'Error: Config creation blocked, config already exists, this is likely malicious'
				);
				return;
			}
			let user = req.body.user;
			let server = req.body.server;
			let db = req.body.db;
			if (!user || !server || !db) {
				res.status(500).send('Missing Fields');
				return;
			}

			let configData = {
				DB_URL: db + '/petio',
				tmdbApi: 'a9a99e29e94d33f6a9a3bb78c7a450f7',
				plexProtocol: server.protocol,
				plexIp: server.host,
				plexPort: server.port,
				plexToken: user.token,
				adminUsername: user.username,
				adminEmail: user.email,
				adminPass: user.password,
				adminId: user.id,
				adminThumb: user.thumb,
				adminDisplayName: user.username,
				fanartApi: '930d724053d35fcc01a1a6da58fbb80a',
			};
			try {
				await this.createConfig(JSON.stringify(configData, null, 2));
				await this.createDefaults();
				res.send('Config Created');
				console.log('Config Created');
				this.restart();
				return;
			} catch (err) {
				res.status(500).send('Error Creating config');
				console.log('Config creation error');
				console.log(err);
			}
		});
	}

	createConfig(data) {
		return new Promise((resolve, reject) => {
			let project_folder, configFile;
			if (process.pkg) {
				project_folder = path.dirname(process.execPath);
				configFile = path.join(project_folder, './config/config.json');
			} else {
				project_folder = __dirname;
				configFile = path.join(project_folder, './config/config.json');
			}
			console.log(configFile);
			fs.writeFile(configFile, data, (err) => {
				if (err) {
					console.log(err);
					reject(err);
					console.log('Config Failed');
				} else {
					console.log(data);
					resolve();
					console.log('Config Created');
				}
			});
		});
	}

	async createDefaults() {
		let project_folder = __dirname;
		let email = path.join(project_folder, './config/email.json');
		let emailDefault = JSON.stringify({
			emailUser: '',
			emailPass: '',
			emailServer: '',
			emailPort: '',
			emailSecure: false,
		});

		let radarr = path.join(project_folder, './config/radarr.json');
		let radarrDefault = JSON.stringify({
			enabled: false,
			protocol: 'http',
			hostname: '',
			apiKey: '',
			port: false,
			urlBase: '',
			rootPath: '',
			profileId: false,
		});

		let sonarr = path.join(project_folder, './config/sonarr.json');
		let sonarrDefault = JSON.stringify({
			enabled: false,
			apiKey: '',
			hostname: '',
			port: '',
			profileId: '',
			protocol: 'http',
			rootPath: '',
			urlBase: '',
		});
		try {
			await fs.writeFileSync(email, emailDefault);
			await fs.writeFileSync(radarr, radarrDefault);
			await fs.writeFileSync(sonarr, sonarrDefault);

			return;
		} catch (err) {
			console.log('Fatal Error: Cannot create default configs');
			throw err;
		}
	}

	createConfigDir(dir) {
		return new Promise((resolve, reject) => {
			if (fs.existsSync(dir)) {
				resolve();
				return true;
			}
			fs.mkdirSync(dir);
			console.log('Config Directory Created');
			resolve();
		});
	}
}

const API = new Main();
API.init();
