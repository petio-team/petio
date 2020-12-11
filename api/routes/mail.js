const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Mailer = require('../mail/mailer');

router.post('/create', async (req, res) => {
	let email = req.body.email;

	if (!email) {
		res.status(500).send('Missing Fields');
		console.log('Create email config failed');
		return;
	}
	console.log('Creating email config');
	let configData = {
		emailEnabled: email.enabled,
		emailUser: email.user,
		emailPass: email.pass,
		emailServer: email.server,
		emailPort: email.port,
		emailSecure: email.secure,
	};
	configData = JSON.stringify(configData);
	let config = await createConfig(configData);
	if (config) {
		res.json({ config: config });
	}
});

router.get('/config', async (req, res) => {
	let config = await getConfig();
	let data = false;
	if (!config) {
		data = {
			emailEnabled: false,
			emailUser: '',
			emailPass: '',
			emailServer: '',
			emailPort: '',
			emailSecure: false,
		};
	} else {
		data = {
			emailEnabled: config.emailEnabled,
			emailUser: config.emailUser,
			emailPass: true,
			emailServer: config.emailServer,
			emailPort: config.emailPort,
			emailSecure: config.emailSecure,
		};
	}
	res.json({
		config: data,
	});
});

router.get('/test', async (req, res) => {
	let test = new Mailer().test();
	res.json({ result: test });
});

async function getConfig() {
	let project_folder, configFile;
	if (process.pkg) {
		project_folder = path.dirname(process.execPath);
		configFile = path.join(project_folder, './config/email.json');
	} else {
		project_folder = __dirname;
		configFile = path.join(project_folder, '../config/email.json');
	}
	try {
		let data = await fs.readFile(configFile);
		return data;
	} catch (err) {
		return false;
	}
}

function createConfig(data) {
	return new Promise((resolve, reject) => {
		let project_folder, configFile;
		if (process.pkg) {
			project_folder = path.dirname(process.execPath);
			configFile = path.join(project_folder, './config/email.json');
		} else {
			project_folder = __dirname;
			configFile = path.join(project_folder, '../config/email.json');
		}

		fs.writeFile(configFile, data, (err) => {
			if (err) {
				console.log(err);
				resolve(false);
			}
			resolve(true);
		});
	});
}

module.exports = router;
