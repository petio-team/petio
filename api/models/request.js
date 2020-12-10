const mongoose = require('mongoose');

const RequestSchema = mongoose.Schema({
	requestId: String,
	type: String,
	title: String,
	thumb: String,
	imdb_id: String,
	tmdb_id: String,
	tvdb_id: String,
	users: Array,
	sonarrId: Number,
	radarrId: Number,
});

module.exports = mongoose.model('Request', RequestSchema);

// requestId
