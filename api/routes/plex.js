require('dotenv/config');
const express = require('express');
const router = express.Router();
const plexLookup = require('../plex/plexLookup');

router.get('/lookup/:type/:id', async (req, res) => {
	let type = req.params.type;
	let id = req.params.id;
	if (!type || !id || type === 'undefined' || type === 'undefined') {
		res.json({ error: 'invalid' });
	} else {
		let lookup = await plexLookup(id, type);
		res.json(lookup);
	}
});

module.exports = router;
