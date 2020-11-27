// Config
const user_config = require('../util/config');
if (!user_config) {
	return;
}
const prefs = JSON.parse(user_config);

const tmdbApikey = prefs.tmdbApi;
const tmdb = 'https://api.themoviedb.org/3/';
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
