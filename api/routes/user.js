const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Admin = require('../models/admin');
const http = require('follow-redirects').http;

router.get('/thumb/:id', async (req, res) => {
	let userData = false;
	try {
		userData = await User.findById(req.params.id);
	} catch (err) {
		res.json({ error: err });
	}
	if (!userData) {
		try {
			userData = await Admin.findById(req.params.id);
		} catch (err) {
			res.json({ error: err });
		}
	}
	if (userData) {
		let url = userData.thumb;

		var options = {
			host: 'plex.tv',
			path: url.replace('https://plex.tv', ''),
			method: 'GET',
			headers: {
				'content-type': 'image/png',
			},
		};

		var request = http
			.get(options, function (response) {
				res.writeHead(response.statusCode, {
					'Content-Type': response.headers['content-type'],
				});
				response.pipe(res);
			})
			.on('error', function (e) {
				console.log('Got error: ' + e.message, e);
			});
		request.end();
	}
});

router.get('/:id', async (req, res) => {
	try {
		userData = await User.findById(req.params.id);
	} catch (err) {
		res.json({ error: err });
	}
	if (!userData) {
		try {
			userData = await Admin.findById(req.params.id);
		} catch (err) {
			res.json({ error: err });
		}
	}
	if (userData) {
		res.json(userData);
	}
});

module.exports = router;
