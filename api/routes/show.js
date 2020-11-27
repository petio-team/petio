const express = require('express');
const router = express.Router();
const showLookup = require('../tmdb/show');

router.get('/lookup/:id', async (req, res) => {
	let data = await showLookup(req.params.id, false);
	res.json(data);
});

router.get('/lookup/:id/minified', async (req, res) => {
	let data = await showLookup(req.params.id, true);
	res.json(data);
});

module.exports = router;
