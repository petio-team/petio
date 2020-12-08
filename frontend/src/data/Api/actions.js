import { store } from '../store';
import * as types from '../actionTypes';
import * as api from './api';

function finalise(data = false) {
	if (!data) return false;
	return store.dispatch(data);
}

export async function getPopular() {
	let popular = await api.popular();

	if (popular) {
		popular.movies.forEach((movie) => {
			movie.isMinified = true;
			finalise({
				type: types.MOVIE_LOOKUP,
				movie: movie,
				id: movie.id,
			});
		});

		popular.tv.forEach((series) => {
			series.isMinified = true;
			finalise({
				type: types.SERIES_LOOKUP,
				series: series,
				id: series.id,
			});
		});

		finalise({
			type: types.POPULAR,
			popular: {
				movies: popular.movies,
				tv: popular.tv,
				people: popular.people,
			},
		});
	}
}

export async function movie(id, minified = false) {
	let movie = await api.movie(id, minified);

	movie.isMinified = minified;

	finalise({
		type: types.MOVIE_LOOKUP,
		movie: movie,
		id: id,
	});
}

export async function series(id, minified = false) {
	let series = await api.series(id, minified);

	if (!series.id) {
		return false;
	}

	series.isMinified = minified;

	finalise({
		type: types.SERIES_LOOKUP,
		series: series,
		id: id,
	});
}

export async function person(id) {
	let data = await api.actor(id);

	let movies = data.movies;
	let shows = data.tv;
	let info = data.info;

	finalise({
		type: types.PERSON_LOOKUP,
		person: info,
		id: id,
	});

	if (movies.length === 0) {
		finalise({
			type: types.STORE_ACTOR_MOVIE,
			cast: {},
			crew: {},
			id: id,
		});
	} else {
		finalise({
			type: types.STORE_ACTOR_MOVIE,
			cast: movies.cast,
			crew: movies.crew,
			id: id,
		});
	}
	if (shows.length === 0) {
		finalise({
			type: types.STORE_ACTOR_SERIES,
			cast: {},
			crew: {},
			id: id,
		});
	} else {
		finalise({
			type: types.STORE_ACTOR_SERIES,
			cast: shows.cast,
			crew: shows.crew,
			id: id,
		});
	}
}

export async function search(term) {
	let searchResults = await api.search(term);

	return new Promise((resolve, reject) => {
		if (!searchResults) {
			reject();
		}
		searchResults.movies.forEach((movie) => {
			movie.isMinified = true;
			finalise({
				type: types.MOVIE_LOOKUP,
				movie: movie,
				id: movie.id,
			});
		});

		searchResults.shows.forEach((series) => {
			// console.log(series);
			series.isMinified = true;
			finalise({
				type: types.SERIES_LOOKUP,
				series: series,
				id: series.id,
			});
		});

		finalise({
			type: types.SEARCH,
			movies: searchResults.movies,
			series: searchResults.shows,
			people: searchResults.people,
		});

		resolve();
	});
}

export function clearSearch() {
	finalise({
		type: types.SEARCH,
		movies: [],
		series: [],
		people: [],
	});
}

export let top = (type) => {
	return new Promise((resolve, reject) => {
		api.top(type)
			.then((data) => {
				const sorted = Object.values(data)
					.sort((a, b) => a.globalViewCount - b.globalViewCount)
					.reverse();

				resolve(sorted);
			})
			.catch((err) => {
				console.log(err);
				reject('Error getting plex movies');
			});
	});
};

export async function history(user_id, type) {
	return new Promise((resolve, reject) => {
		api.history(user_id, type)
			.then((data) => {
				resolve(data);
			})
			.catch((err) => {
				console.log(err);
				reject('Error getting plex movies');
			});
	});
}

export let get_plex_media = (id, type) => {
	return new Promise((resolve, reject) => {
		api.get_plex_media(id, type)
			.then((res) => {
				resolve(res);
			})
			.catch((err) => {
				reject(err);
			});
	});
};

export function checkConfig() {
	return new Promise((resolve, reject) => {
		api.checkConfig()
			.then((data) => {
				resolve(data);
			})
			.catch((err) => {
				console.log(err);
				reject();
			});
	});
}
