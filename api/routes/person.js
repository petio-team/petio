const express = require('express');
const router = express.Router();
const personLookup = require('../tmdb/person');

router.get('/lookup/:id', async (req, res) => {
	let data = await personLookup(req.params.id);
	res.json(data);
});

module.exports = router;
