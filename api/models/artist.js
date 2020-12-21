const mongoose = require('mongoose');

const MusicSchema = mongoose.Schema(
	{
		title: String,
		ratingKey: Number,
		key: String,
		guid: String,
		type: String,
		summary: String,
		index: Number,
		thumb: String,
		addedAt: Number,
		updatedAt: Number,
		Genre: Array,
		Country: Array,
	},
	{ collection: 'music' }
);

module.exports = mongoose.model('Music', MusicSchema);

// ratingKey
