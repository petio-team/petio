const Movie = require('../models/movie');
const Show = require('../models/show');

async function plexLookup(id, type) {
	let plexMatch = false;
	if (type === 'movie') {
		plexMatch = await Movie.findOne({
			ratingKey: id,
		}).exec();
	} else {
		plexMatch = await Show.findOne({
			ratingKey: id,
		}).exec();
	}
	if (!plexMatch) {
		return { error: 'not found, invalid key' };
	} else {
		return plexMatch;
	}
}

module.exports = plexLookup;
