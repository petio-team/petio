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
	if (admin) {
		if (authToken) {
			let adminQuick = false;
			adminQuick = await getAdmin(authToken);

			if (adminQuick) {
				res.json({
					admin: true,
					loggedIn: true,
					user: adminQuick,
					quick: true,
				});
			} else {
				res.json({
					admin: false,
					loggedIn: false,
					error: 'invalid token',
				});
			}
		} else {
			let plexAuth = await adminAuth(
				req.body.username,
				req.body.password
			);
			if (plexAuth.error) {
				res.json({
					admin: false,
					loggedIn: false,
					user: plexAuth.error,
				});
			} else {
				plexAuth = plexAuth.user;

				let username = adminUser;
				let email = adminEmail;
				let pass = adminPass;
				if (
					(username === req.body.username ||
						email === req.body.username) &&
					pass === req.body.password
				) {
					try {
						let adminData = await setAdmin(plexAuth);
						res.json({
							admin: true,
							loggedIn: true,
							user: adminData,
							quick: false,
						});
						console.log('admin login');
					} catch (err) {
						res.json({
							admin: false,
							loggedIn: false,
							error: err,
						});
					}
				} else {
					res.json({ admin: false, loggedIn: false });
					console.log('admin login failed');
					console.log(pass === req.body.password);
				}
			}
		}
	} else {
		getFriend(req.body.username, res);
	}
});

async function getAdmin(token) {
	let admin = await Admin.findOne({
		$or: [{ authToken: token }],
	});
	if (admin) {
		return admin;
	} else {
		return false;
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
		res.json({ admin: false, loggedIn: true, user: friend });
	} else {
		res.json({ admin: false, loggedIn: false });
	}
}

async function adminAuth(user, pass) {
	return new Promise((resolve, reject) => {
		var auth = 'Basic ' + new Buffer(user + ':' + pass).toString('base64');
		headers['Authorization'] = auth;
		request(
			plexAuthUrl,
			{
				headers: headers,
				method: 'POST',
				json: true,
			},
			function (err, data) {
				if (err) {
					reject(err);
				}

				resolve(data);
			}
		);
	});
}

module.exports = router;
