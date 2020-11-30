import * as types from '../actionTypes';

export default function (
	state = {
		token: false,
	},
	action
) {
	switch (action.type) {
		case types.PLEX_TOKEN:
			return {
				...state,
				token: action.token,
			};

		default:
			return state;
	}
}
