const express = require('express');
const router = express.Router();
const getTop = require('../plex/top');

router.get('/movies', async (req, res) => {
	let data = await getTop(1);
	res.json(data);
});

router.get('/shows', async (req, res) => {
	let data = await getTop(2);
	res.json(data);
});

module.exports = router;
