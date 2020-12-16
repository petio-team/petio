// Config
const getConfig = require('../util/config');

const express = require('express');
const router = express.Router();
const Request = require('../models/request');
const User = require('../models/user');
const Mailer = require('../mail/mailer');
const Sonarr = require('../services/sonarr');
const Radarr = require('../services/radarr');

router.post('/add', async (req, res) => {
	let user = req.body.user;
	let request = req.body.request;
	let existing = await Request.findOne({ requestId: request.id });
	if (existing) {
		let updatedRequest = await Request.updateOne(
			{ requestId: request.id },
			{ $push: { users: user._id } }
		);
		res.json(updatedRequest);
		mailRequest(user._id, request.id);
	} else {
		const newRequest = new Request({
			requestId: request.id,
			type: request.type,
			title: request.title,
			thumb: request.thumb,
			users: [user._id],
			imdb_id: request.imdb_id,
			tmdb_id: request.tmdb_id,
			tvdb_id: request.tvdb_id,
		});

		try {
			const savedRequest = await newRequest.save();
			res.json(savedRequest);
			mailRequest(user._id, request.id);
			let sonarr = new Sonarr();
			let radarr = new Radarr();
			sonarr.getRequests();
			radarr.getRequests();
		} catch (err) {
			console.log(err);
			res.status(500).json({ error: 'error adding request' });
		}
	}
});

async function mailRequest(user, request) {
	const prefs = getConfig();
	let userData = await User.findOne({ _id: user });
	if (!userData) {
		userData = {
			email: prefs.adminEmail,
		};
	}
	const requestData = await Request.findOne({ requestId: request });
	console.log(requestData);
	let type = requestData.type === 'tv' ? 'TV Show' : 'Movie';
	new Mailer().mail(
		`You've just requested the ${type} ${requestData.title}`,
		`${type}: ${requestData.title}`,
		`Your request has been received and you'll receive an email once it has been added to Plex!`,
		`https://image.tmdb.org/t/p/w500${requestData.thumb}`,
		[userData.email]
	);
}

router.get('/all', async (req, res) => {
	const requests = await Request.find();
	let data = {};
	let sonarr = new Sonarr();
	let radarr = new Radarr();
	requests.map((request, i) => {
		// data[request.requestId] = request;
		// data[request.requestId].radarr = false;
		// data[request.requestId].sonarr = false;
		request.test = 'test';
		if (request.type === 'tv' && request.sonarrId) {
			request.sonarr = sonarr.series(request.sonarrId);
		}
		if (request.type === 'movie' && request.radarrId) {
			request.radarr = radarr.movie(request.radarrId);
		}
		data[request.requestId] = request;
		console.log(data[request.requestId]);
	});
	res.json(data);
});

module.exports = router;
