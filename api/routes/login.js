const jwt = require('jsonwebtoken');
// Config
const user_config = require('../util/config');
if (!user_config) {
	return;
}
const prefs = JSON.parse(user_config);

const adminUser = prefs.adminUsername;
const adminEmail = prefs.adminEmail;
const adminPass = prefs.adminPass;
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const request = require('xhr-request');
const Admin = require('../models/admin');
const user = require('../models/user');
const plexAuthUrl = 'https://plex.tv/users/sign_in.json';
let headers = {
	'X-Plex-Device': 'Petio-rest',
	'X-Plex-Device-Name': 'Web Browser',
	'X-Plex-Product': 'Petio',
	'X-Plex-Version': 'v1.0',
	'X-Plex-Platform-Version': 'v1.0',
	'X-Plex-Client-Identifier': 'ed3f4b64-1954-11eb-adc1-0242ac120002',
};

router.post('/', async (req, res) => {
	let admin = req.body.admin;
	let authToken = req.body.authToken;
	let username = req.body.username;
	let password = req.body.password;

	if (authToken) {
		try {
			let decoded = jwt.verify(authToken, prefs.plexToken);
			let user = decoded;
			if (user.admin) {
				getAdmin(user.username, res);
			} else {
				getFriend(user.username, res);
			}
		} catch {
			res.json({
				admin: false,
				loggedIn: false,
				user: false,
				token: false,
			});
			return;
		}
	} else {
		if (!username || !password) {
			res.json({
				admin: false,
				loggedIn: false,
				user: false,
				token: false,
			});
			return;
		}
		if (admin) {
			getAdmin(username, res);
		} else {
			getFriend(username, res);
		}
	}
});

function createToken(user, admin = false) {
	return jwt.sign(
		{ username: user.username, admin: admin },
		prefs.signingKey
	);
}

async function getAdmin(username, res) {
	let admin = await Admin.findOne({
		$or: [{ username: username }, { email: username }],
	});
	if (admin) {
		res.json({
			admin: true,
			loggedIn: true,
			user: admin,
			token: createToken(admin, true),
		});
	} else {
		res.json({
			admin: false,
			loggedIn: false,
			user: admin,
			token: false,
		});
	}
}

async function setAdmin(obj) {
	let admin = await Admin.findOne({
		username: obj.username,
		uuid: obj.uuid,
	});
	let adminData = false;
	if (admin) {
		try {
			adminData = await Admin.findOneAndUpdate(
				{ _id: obj.id },
				{
					$set: {
						authToken: obj.authToken,
						authentication_token: obj.authentication_token,
						email: obj.email,
						thumb: obj.thumb,
						title: obj.title,
						username: obj.username,
						uuid: obj.uuid,
					},
				},
				{ new: true, useFindAndModify: false }
			);
		} catch (err) {
			console.log(err);
		}
		return adminData;
	} else {
		try {
			adminData = new Admin({
				_id: obj.id,
				authToken: obj.authToken,
				authentication_token: obj.authentication_token,
				email: obj.email,
				thumb: obj.thumb,
				title: obj.title,
				username: obj.username,
				uuid: obj.uuid,
			});
			await adminData.save();
		} catch (err) {
			console.log(err);
		}
		return adminData;
	}
}

async function getFriend(username, res) {
	let friend = await User.findOne({
		$or: [{ username: username }, { email: username }, { title: username }],
	});
	if (friend) {
		res.json({
			admin: false,
			loggedIn: true,
			user: friend,
			token: createToken(friend, false),
		});
	} else {
		res.json({ admin: false, loggedIn: false, token: false });
	}
}

module.exports = router;
