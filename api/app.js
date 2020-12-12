const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const CronJob = require('cron').CronJob;
const https = require('https');
const fs = require('fs');

// Config
const user_config = require('./util/config');
const prefs = JSON.parse(user_config);

// Plex
const libraryUpdate = require('./plex/libraryUpdate');

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
const setupRoute = require('./routes/setup');
const servicesRoute = require('./routes/services');
const mailRoute = require('./routes/mail');

app.use(cors());
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/config', async (req, res) => {
	res.json(user_config ? { config: true } : { config: false });
});

if (!user_config) {
	console.log('Starting Server ');
	console.log('No config, entering setup mode');
	app.use('/setup', setupRoute);
	app.listen(7778);
	console.log('Listening on 7778');
} else {
	// Routing
	app.use('/login', loginRoute);
	app.use('/movie', movieRoute);
	app.use('/show', showRoute);
	app.use('/person', personRoute);
	app.use('/search', searchRoute);
	app.use('/trending', trendingRoute);
	app.use('/request', requestRoute);
	app.use('/top', topRoute);
	app.use('/history', historyRoute);
	app.use('/plex', plexRoute);
	app.use('/review', reviewRoute);
	app.use('/user', userRoute);
	app.use('/genie', genieRoute);
	app.use('/sessions', sessionsRoute);
	app.use('/services', servicesRoute);
	app.use('/mail', mailRoute);

	console.log('Connecting to Database, please wait....');
	connectDb();

	async function connectDb() {
		try {
			await mongoose.connect(prefs.DB_URL, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			});
			console.log('Connected to Database ');
			start();
		} catch (err) {
			console.log('Fatal error - database misconfigured!');
			console.log('Removing config please restart');
			fs.unlinkSync('./config.json');
		}
	}

	async function start() {
		console.log('Starting Server ');
		app.listen(7778);
		console.log('Listening on 7778');
		const libraryWatch = new CronJob('0 */30 * * * *', function () {
			const d = new Date();
			console.log('Library Watch Running:', d);
			libraryUpdate();
		});

		libraryWatch.start();

		libraryUpdate();
	}
}
