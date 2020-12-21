const mongoose = require('mongoose');

const TvSchema = mongoose.Schema(
	{
		ratingKey: Number,
		key: String,
		guid: String,
		studio: String,
		type: String,
		title: String,
		titleSort: String,
		contentRating: String,
		summary: String,
		index: Number,
		rating: Number,
		year: Number,
		thumb: String,
		art: String,
		banner: String,
		theme: String,
		duration: Number,
		originallyAvailableAt: String,
		leafCount: Number,
		viewedLeafCount: Number,
		childCount: Number,
		addedAt: Number,
		updatedAt: Number,
		Genre: Array,
		idSource: String,
		externalId: String,
		tvdb_id: String,
		imdb_id: String,
		tmdb_id: String,
	},
	{ collection: 'shows' }
);

module.exports = mongoose.model('Show', TvSchema);

// ratingKey
