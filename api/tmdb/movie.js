// Config
const user_config = require('../util/config');
if (!user_config) {
	return;
}
const prefs = JSON.parse(user_config);

const tmdbApikey = prefs.tmdbApi;
const tmdb = 'https://api.themoviedb.org/3/';
const fanartLookup = require('../fanart');
const request = require('xhr-request');
const onServer = require('../plex/onServer');

async function movieLookup(id, minified = false) {
	let fanart = minified ? false : await fanartLookup(id, 'movies');
	let movie = false;
	try {
		movie = await getMovieData(id);
	} catch {
		return { error: 'not found' };
	}
	if (movie) {
		if (fanart) {
			if (fanart.hdmovielogo) {
				movie.logo = findEnLogo(fanart.hdmovielogo);
			}
			if (fanart.moviethumb) {
				movie.tile = findEnLogo(fanart.moviethumb);
			}
		}
		let onPlex = await onServer('movie', movie.imdb_id, false, id);
		let recommendations = await getRecommendations(id);
		let recommendationsData = [];
		movie.on_server = onPlex.exists;
		movie.available_resolutions = onPlex.resolutions;
		if (recommendations.results) {
			Object.keys(recommendations.results).map((key) => {
				let recommendation = recommendations.results[key];
				recommendationsData.push(recommendation.id);
			});
		}
		movie.recommendations = recommendationsData;
		delete movie.production_countries;
		delete movie.budget;
		delete movie.adult;
		delete movie.original_language;
		delete movie.original_title;
		delete movie.production_companies;
		if (minified) {
			delete movie.credits;
			delete movie.backdrop_path;
			delete movie.belongs_to_collection;
			delete movie.genres;
			delete movie.homepage;
			delete movie.popularity;
			delete movie.recommendations;
			delete movie.revenue;
			delete movie.runtime;
			delete movie.spoken_languages;
			delete movie.status;
			delete movie.tagline;
			delete movie.videos;
			delete movie.vote_average;
			delete movie.vote_count;
		}
		if (!movie.id) {
			return { error: 'no id returned' };
		}
		return movie;
	}
}

async function getMovieData(id) {
	let url = `${tmdb}movie/${id}?api_key=${tmdbApikey}&append_to_response=credits,videos`;
	return new Promise((resolve, reject) => {
		request(
			url,
			{
				method: 'GET',
				json: true,
			},
			function (err, data) {
				if (err) {
					reject();
				}
				// console.log(data);
				resolve(data);
			}
		);
	});
}

async function getRecommendations(id) {
	let url = `${tmdb}movie/${id}/recommendations?api_key=${tmdbApikey}&append_to_response=credits,videos`;

	return new Promise((resolve, reject) => {
		request(
			url,
			{
				method: 'GET',
				json: true,
			},
			function (err, data) {
				if (err) {
					reject(err);
				}

				resolve(data);
			}
		);
	});
}

function findEnLogo(logos) {
	let logoUrl = false;
	logos.forEach((logo) => {
		if (logo.lang === 'en' && !logoUrl) {
			logoUrl = logo.url;
		}
	});
	return logoUrl;
}

module.exports = movieLookup;
