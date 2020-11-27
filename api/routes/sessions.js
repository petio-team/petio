const express = require('express');
const router = express.Router();
const getSessions = require('../plex/sessions');

router.get('/', async (req, res) => {
	try {
		let data = await getSessions();
		res.json(data.MediaContainer);
	} catch (err) {
		console.log(err);
		res.send(500);
	}
});

module.exports = router;
