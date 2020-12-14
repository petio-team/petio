// Config
const getConfig = require('../util/config');
const request = require('xhr-request');
const onServer = require('../plex/onServer');
const fanartLookup = require('../fanart');

async function trending() {
	let person = await getPerson();
	let movies = await getMovies();
	let tv = await getShows();

	// movies.results.map((el, i) => {
	// 	movies.results[i] = el.id;
	// });

	// // person.results.map((el, i) => {
	// // 	person.results[i] = el.id;
	// // });

	// tv.results.map((el, i) => {
	// 	tv.results[i] = el.id;
	// });

	for (let i = 0; i < movies.results.length; i++) {
		let res = await onServer('movie', false, false, movies.results[i].id);
		// let fanart = await fanartLookup(movies.results[i].id, 'movies');
		movies.results[i].on_server = res.exists;
		// if (fanart) {
		// 	if (fanart.hdmovielogo) {
		// 		movies.results[i].logo = findEnLogo(fanart.hdmovielogo);
		// 	}
		// 	if (fanart.moviethumb) {
		// 		movies.results[i].tile = findEnLogo(fanart.moviethumb);
		// 	}
		// }
	}

	for (let i = 0; i < tv.results.length; i++) {
		let res = await onServer('show', false, false, tv.results[i].id);
		// let fanart = await fanartLookup(tv.results[i].id, 'tv');
		tv.results[i].on_server = res.exists;

		// if (fanart) {
		// 	if (fanart.hdtvlogo) {
		// 		tv.results[i].logo = findEnLogo(fanart.hdtvlogo);
		// 	}
		// 	if (fanart.tvthumb) {
		// 		tv.results[i].tile = findEnLogo(fanart.tvthumb);
		// 	}
		// }
	}

	let data = {
		people: person.results,
		movies: movies.results,
		tv: tv.results,
	};

	return data;
}

function getPerson() {
	const config = getConfig();
	const tmdbApikey = config.tmdbApi;
	const tmdb = 'https://api.themoviedb.org/3/';
	let url = `${tmdb}trending/person/week?api_key=${tmdbApikey}&append_to_response=images`;
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

function getMovies() {
	const config = getConfig();
	const tmdbApikey = config.tmdbApi;
	const tmdb = 'https://api.themoviedb.org/3/';
	let url = `${tmdb}trending/movie/week?api_key=${tmdbApikey}&append_to_response=images`;
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

function getShows() {
	const config = getConfig();
	const tmdbApikey = config.tmdbApi;
	const tmdb = 'https://api.themoviedb.org/3/';
	let url = `${tmdb}trending/tv/week?api_key=${tmdbApikey}&append_to_response=images`;
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

function findEnLogo(logos) {
	let logoUrl = false;
	logos.forEach((logo) => {
		if (logo.lang === 'en' && !logoUrl) {
			logoUrl = logo.url;
		}
	});
	return logoUrl;
}

module.exports = trending;
