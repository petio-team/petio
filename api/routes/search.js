const express = require('express');
const router = express.Router();
const search = require('../tmdb/search');

router.get('/:term', async (req, res) => {
	let data = await search(req.params.term);
	res.json(data);
});

module.exports = router;
