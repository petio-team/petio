// Config
const getConfig = require('../util/config');
const request = require('xhr-request');

async function personLookup(id) {
	let info = await getPersonInfo(id);
	let movies = await getPersonMovies(id);
	let tv = await getPersonShows(id);

	let person = {
		info: info,
		movies: movies,
		tv: tv,
	};

	return person;
}

async function getPersonInfo(id) {
	const config = getConfig();
	const tmdbApikey = config.tmdbApi;
	const tmdb = 'https://api.themoviedb.org/3/';
	let url = `${tmdb}person/${id}?api_key=${tmdbApikey}&append_to_response=images`;
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

				resolve(data);
			}
		);
	});
}

async function getPersonMovies(id) {
	const config = getConfig();
	const tmdbApikey = config.tmdbApi;
	const tmdb = 'https://api.themoviedb.org/3/';
	let url = `${tmdb}person/${id}/movie_credits?api_key=${tmdbApikey}&append_to_response=credits,videos`;
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

				resolve(data);
			}
		);
	});
}

async function getPersonShows(id) {
	const config = getConfig();
	const tmdbApikey = config.tmdbApi;
	const tmdb = 'https://api.themoviedb.org/3/';
	let url = `${tmdb}person/${id}/tv_credits?api_key=${tmdbApikey}&append_to_response=credits,videos`;
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

				resolve(data);
			}
		);
	});
}

module.exports = personLookup;
