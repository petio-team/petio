const express = require('express');
const router = express.Router();
const Sonarr = require('../services/sonarr');

router.get('/sonarr/paths', async (req, res) => {
	let data = await new Sonarr().getPaths();
	data.forEach((el) => {
		delete el.unmappedFolders;
	});
	res.json(data);
});

router.get('/sonarr/profiles', async (req, res) => {
	let data = await new Sonarr().getProfiles();
	res.json(data);
});

router.get('/sonarr/test', async (req, res) => {
	let data = {
		connection: await new Sonarr().test(),
	};
	res.json(data);
});

module.exports = router;
