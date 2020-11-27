const Library = require('../models/library');
const Movie = require('../models/movie');
const Music = require('../models/artist');
const Show = require('../models/show');
const User = require('../models/user');

async function onServer(type, imdb, tvdb, tmdb) {
	if (type === 'movie') {
		let foundItemsImdb = false;
		let foundItemsTvdb = false;
		let foundItemsTmdb = false;

		let found = false;

		if (imdb) {
			foundItemsImdb = await Movie.find({
				imdb_id: imdb.toString(),
			}).exec();
			found = foundItemsImdb;
		}

		if (tvdb) {
			foundItemsTvdb = await Movie.find({
				externalId: tvdb.toString(),
			}).exec();
			found = foundItemsTvdb;
		}

		if (tmdb) {
			foundItemsTmdb = await Movie.find({
				tmdb_id: tmdb.toString(),
			}).exec();
			found = foundItemsTmdb;
		}

		if (
			foundItemsImdb.length ||
			foundItemsTvdb.length ||
			foundItemsTmdb.length
		) {
			let resolutions = [];
			if (found) {
				Object.keys(found).map((i) => {
					let item = found[i];
					if (item.Media.length > 0) {
						resolutions.push(item.Media[0].videoResolution);
					}
				});
			}
			return { exists: true, resolutions: resolutions };
		} else {
			return { exists: false, resolutions: [] };
		}
	}

	if (type === 'show') {
		let foundItemImdb = false;
		let foundItemTvdb = false;
		let foundItemTmdb = false;

		if (imdb) {
			foundItemImdb = await Show.findOne({
				imdb_id: imdb.toString(),
			}).exec();
		}

		if (tvdb) {
			foundItemTvdb = await Show.findOne({
				tvdb_id: tvdb.toString(),
			}).exec();
		}

		if (tmdb) {
			foundItemTmdb = await Show.findOne({
				tmdb_id: tmdb.toString(),
			}).exec();
		}

		if (foundItemImdb || foundItemTvdb || foundItemTmdb) {
			return { exists: true, resolutions: [] };
		} else {
			return { exists: false, resolutions: [] };
		}
	}
}

module.exports = onServer;
