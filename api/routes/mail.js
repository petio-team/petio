const express = require('express');
const router = express.Router();
const Example = require('../models/example');

router.get('/', async (req, res) => {
	try {
		const examples = await Example.find();
		res.json(examples);
	} catch (err) {
		res.status(500).json({ error: err });
	}
});

router.get('/specific', (req, res) => {
	res.send('specific');
});

router.post('/', async (req, res) => {
	const example = new Example({
		title: req.body.title,
		content: req.body.content,
	});

	try {
		const savedExample = await example.save();
		res.json(savedExample);
	} catch (err) {
		res.status(500).json({ error: err });
	}
});

router.get('/:postId', async (req, res) => {
	try {
		const example = await Example.findById(req.params.postId);
		res.json(example);
	} catch (err) {
		res.status(404).json({ message: 'not found' });
	}
});

router.patch('/:postId', async (req, res) => {
	try {
		const example = await Example.updateOne(
			{ _id: req.params.postId },
			{
				$set: {
					title: req.body.title,
				},
			}
		);
		res.json(example);
	} catch (err) {
		res.status(404).json({ message: 'not found' });
	}
});

module.exports = router;
