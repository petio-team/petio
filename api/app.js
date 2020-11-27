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
// if (!user_config) {
// 	return;
// }
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

app.use(cors());
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded());

app.get('/config', async (req, res) => {
	res.json(user_config ? { config: true } : { config: false });
});

if (!user_config) {
	console.log('Starting Server ');
	console.log('No config, entering setup mode');
	app.use('/setup', setupRoute);
	app.listen(32600);
	console.log('Listening on 32600');
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

	console.log('Connecting to Database, please wait....');
	mongoose.connect(
		prefs.DB_URL,
		{ useNewUrlParser: true, useUnifiedTopology: true },
		() => {
			console.log('Connected to Database ');
			start();
		}
	);
	function start() {
		console.log('Starting Server ');
		app.listen(32600);
		console.log('Listening on 32600');
		const libraryWatch = new CronJob('0 */30 * * * *', function () {
			const d = new Date();
			console.log('Library Watch Running:', d);
			libraryUpdate();
		});

		let privateKey = false,
			certificate = false,
			ca = false;

		try {
			console.log(prefs.ssl_key);
			privateKey = fs.readFileSync(prefs.ssl_key, 'utf8');
			certificate = fs.readFileSync(prefs.ssl_cert, 'utf8');
			ca = fs.readFileSync(prefs.ssl_chain, 'utf8');
		} catch (err) {
			console.log('Certificates Not Found, falling back to HTTP');
		}

		if (privateKey && certificate && ca) {
			const cert = {
				key: privateKey,
				cert: certificate,
				ca: ca,
			};

			const httpsServer = https.createServer(cert, app);
			httpsServer.listen(32601, () => {
				console.log(`HTTPS Server running on port ${32601}`);
			});
			console.log('Listening on SSL 32601');
			libraryWatch.start();
			console.log('Library Watch Started...');
		} else {
			console.log('Not running SSL');
		}
		// libraryUpdate();
	}
}
