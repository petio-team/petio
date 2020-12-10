const express = require('express');
const router = express.Router();
const Sonarr = require('../services/sonarr');
const Radarr = require('../services/radarr');
const fs = require('fs');
const path = require('path');

// Sonnarr

router.get('/sonarr/paths', async (req, res) => {
	try {
		let data = await new Sonarr().getPaths();

		data.forEach((el) => {
			delete el.unmappedFolders;
		});
		res.json(data);
	} catch {
		res.json([]);
	}
});

router.get('/sonarr/profiles', async (req, res) => {
	try {
		let data = await new Sonarr().getProfiles();
		res.json(data);
	} catch {
		res.json([]);
	}
});

router.get('/sonarr/test', async (req, res) => {
	let data = {
		connection: await new Sonarr().test(),
	};
	res.json(data);
});

router.get('/sonarr/config', async (req, res) => {
	let config = new Sonarr().getConfig();
	res.json(config);
});

router.post('/sonarr/config', async (req, res) => {
	let apiKey = req.body.apiKey;
	let enabled = req.body.enabled;
	let hostname = req.body.hostname;
	let port = req.body.port;
	let profileId = req.body.profileId;
	let protocol = req.body.protocol;
	let rootPath = req.body.rootPath;
	let urlBase = req.body.urlBase;
	let data = {
		enabled: enabled,
		apiKey: apiKey,
		hostname: hostname,
		port: port,
		profileId: profileId,
		protocol: protocol,
		rootPath: rootPath,
		urlBase: urlBase,
	};
	try {
		await saveSonarrConfig(data);
		res.json(data);
		return;
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: err });
		return;
	}
});

function saveSonarrConfig(data) {
	return new Promise((resolve, reject) => {
		let project_folder, configFile;
		if (process.pkg) {
			project_folder = path.dirname(process.execPath);
			configFile = path.join(project_folder, './config/sonarr.json');
		} else {
			project_folder = __dirname;
			configFile = path.join(project_folder, '../config/sonarr.json');
		}
		data = JSON.stringify(data);
		fs.writeFile(configFile, data, (err) => {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				console.log('Sonarr Config updated');
				resolve(data);
			}
		});
	});
}

// Radarr

router.get('/radarr/paths', async (req, res) => {
	try {
		let data = await new Radarr().getPaths();

		data.forEach((el) => {
			delete el.unmappedFolders;
		});
		res.json(data);
	} catch {
		res.json([]);
	}
});

router.get('/radarr/profiles', async (req, res) => {
	try {
		let data = await new Radarr().getProfiles();
		res.json(data);
	} catch {
		res.json([]);
	}
});

router.get('/radarr/test', async (req, res) => {
	let data = {
		connection: await new Radarr().test(),
	};
	res.json(data);
});

router.get('/radarr/config', async (req, res) => {
	let config = new Radarr().getConfig();
	res.json(config);
});

router.get('/radarr/test', async (req, res) => {
	let data = {
		connection: await new Radarr().test(),
	};
	res.json(data);
});

router.post('/radarr/config', async (req, res) => {
	let apiKey = req.body.apiKey;
	let enabled = req.body.enabled;
	let hostname = req.body.hostname;
	let port = req.body.port;
	let profileId = req.body.profileId;
	let protocol = req.body.protocol;
	let rootPath = req.body.rootPath;
	let urlBase = req.body.urlBase;
	let data = {
		enabled: enabled,
		apiKey: apiKey,
		hostname: hostname,
		port: port,
		profileId: profileId,
		protocol: protocol,
		rootPath: rootPath,
		urlBase: urlBase,
	};
	try {
		await saveRadarrConfig(data);
		res.json(data);
		return;
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: err });
		return;
	}
});

function saveRadarrConfig(data) {
	return new Promise((resolve, reject) => {
		let project_folder, configFile;
		if (process.pkg) {
			project_folder = path.dirname(process.execPath);
			configFile = path.join(project_folder, './config/radarr.json');
		} else {
			project_folder = __dirname;
			configFile = path.join(project_folder, '../config/radarr.json');
		}
		data = JSON.stringify(data);
		fs.writeFile(configFile, data, (err) => {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				console.log('Radarr Config updated');
				resolve();
			}
		});
	});
}

module.exports = router;
