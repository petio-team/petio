import * as types from '../actionTypes';

export default function (
	state = {
		user_roles: {
			permissions: [],
			rules: [],
			seen_clients: [],
			blocked_clients: [],
			id: false,
			username: false,
			owner: false,
			__v: 0,
		},
		logged_in: false,
		servers: false,
		config: 'pending',
		activeServer: false,
		popular: {},
		movie_lookup: {},
		series_lookup: {},
		season_lookup: {},
		person_lookup: {},
		search_results: {
			movies: [],
			series: [],
			people: [],
		},
		actor_movie: {},
		actor_series: {},
	},
	action
) {
	switch (action.type) {
		case types.MB_LOGIN:
			return {
				...state,
				current_user: {
					username: action.username,
					email: action.email,
					thumb: action.thumb,
				},
				servers: action.servers,
				logged_in: true,
			};

		case types.MB_USER_ROLES:
			return {
				...state,
				user_roles: action.user,
			};

		case types.MB_CONFIG_SETUP_START:
			return {
				...state,
				config: false,
			};

		case types.MB_CONFIG_LOADED:
		case types.MB_CONFIG_SETUP_END:
			return {
				...state,
				config: action.config,
			};

		case types.MB_ACTIVE_SERVER:
			return {
				...state,
				activeServer: action.server,
			};

		case types.POPULAR:
			return {
				...state,
				popular: action.popular,
				updated: true,
			};

		case types.SEARCH:
			return {
				...state,
				search_results: {
					movies: action.movies,
					series: action.series,
					people: action.people,
				},
			};

		case types.MOVIE_LOOKUP:
			let creditCache = {};
			if (action.movie) {
				if (action.movie.credits) {
					Object.keys(action.movie.credits).forEach((key) => {
						Object.keys(action.movie.credits[key]).forEach(
							(skey) => {
								creditCache[
									action.movie.credits[key][skey].id
								] = action.movie.credits[key][skey];
							}
						);
					});
				}
			}

			return {
				...state,
				movie_lookup: {
					...state.movie_lookup,
					[action.id]: action.movie,
				},
				actor_cache: {
					creditCache,
				},
				updated: true,
			};

		case types.PERSON_LOOKUP:
			return {
				...state,
				person_lookup: {
					...state.movie_lookup,
					[action.id]: action.person,
				},
				updated: true,
			};

		case types.SERIES_LOOKUP:
			let creditCacheS = {};
			if (action.series)
				if (action.series.credits) {
					Object.keys(action.series.credits).forEach((key) => {
						Object.keys(action.series.credits[key]).forEach(
							(skey) => {
								creditCacheS[
									action.series.credits[key][skey].id
								] = action.series.credits[key][skey];
							}
						);
					});
				}

			return {
				...state,
				series_lookup: {
					...state.series_lookup,
					[action.id]: action.series,
				},
				actor_cache: {
					creditCacheS,
				},
				updated: true,
			};

		case types.SEASON_LOOKUP:
			return {
				...state,
				season_lookup: {
					...state.season_lookup,
					[`${action.series}_s${action.season}`]: action.data,
				},
			};

		case types.STORE_ACTOR_MOVIE:
			return {
				...state,
				actor_movie: {
					...state.actor_movie,
					[action.id]: {
						cast: action.cast,
						crew: action.crew,
					},
				},
				updated: true,
			};

		case types.STORE_ACTOR_SERIES:
			return {
				...state,
				actor_series: {
					...state.actor_series,
					[action.id]: {
						cast: action.cast,
						crew: action.crew,
					},
				},
				updated: true,
			};

		default:
			return state;
	}
}
