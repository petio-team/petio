const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.post('/set', async (req, res) => {
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
		createConfig(JSON.stringify(configData, null, 2));
		res.send('Config Created');
		return;
	} catch (err) {
		res.status(500).send('Error Creating config');
	}
});
function createConfig(data) {
	return new Promise((resolve, reject) => {
		let project_folder, configFile;
		if (process.pkg) {
			project_folder = path.dirname(process.execPath);
			configFile = path.join(project_folder, './config/config.json');
		} else {
			project_folder = __dirname;
			configFile = path.join(project_folder, '../config/config.json');
		}
		console.log(configFile);
		fs.writeFileSync(configFile, data, (err) => {
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

module.exports = router;
