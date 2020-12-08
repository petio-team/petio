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
				getAdmin(user.username, user.password, res);
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
		if (!username || (!password && admin)) {
			res.json({
				admin: false,
				loggedIn: false,
				user: false,
				token: false,
			});
			return;
		}
		if (admin) {
			getAdmin(username, password, res);
		} else {
			getFriend(username, res);
		}
	}
});

function createToken(user, admin = false) {
	return jwt.sign(
		{ username: user.username, password: user.password, admin: admin },
		prefs.plexToken
	);
}

async function getAdmin(username, password, res) {
	let admin = await Admin.findOne({
		$or: [
			{ username: username, password: password },
			{ email: username, password: password },
		],
	});
	// Need to validate PW here ^
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

// async function setAdmin(obj) {
// 	let admin = await Admin.findOne({
// 		username: obj.username,
// 		uuid: obj.uuid,
// 	});
// 	let adminData = false;
// 	if (admin) {
// 		try {
// 			adminData = await Admin.findOneAndUpdate(
// 				{ _id: obj.id },
// 				{
// 					$set: {
// 						authToken: obj.authToken,
// 						authentication_token: obj.authentication_token,
// 						email: obj.email,
// 						thumb: obj.thumb,
// 						title: obj.title,
// 						username: obj.username,
// 						uuid: obj.uuid,
// 					},
// 				},
// 				{ new: true, useFindAndModify: false }
// 			);
// 		} catch (err) {
// 			console.log(err);
// 		}
// 		return adminData;
// 	} else {
// 		try {
// 			adminData = new Admin({
// 				_id: obj.id,
// 				authToken: obj.authToken,
// 				authentication_token: obj.authentication_token,
// 				email: obj.email,
// 				thumb: obj.thumb,
// 				title: obj.title,
// 				username: obj.username,
// 				uuid: obj.uuid,
// 			});
// 			await adminData.save();
// 		} catch (err) {
// 			console.log(err);
// 		}
// 		return adminData;
// 	}
// }

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
		try {
			let admin = await Admin.findOne({
				$or: [{ username: username }, { email: username }],
			});
			if (admin) {
				admin.password = '';
				res.json({
					admin: false,
					loggedIn: true,
					user: admin,
					token: createToken(admin, false),
				});
			} else {
				res.json({ admin: false, loggedIn: false, token: false });
			}
		} catch (err) {
			res.json({ admin: false, loggedIn: false, token: false });
		}
	}
}

module.exports = router;
