import * as types from '../actionTypes';

export default function (
	state = {
		current: false,
		logged_in: false,
		library_index: false,
		email: false,
		requests: false,
	},
	action
) {
	switch (action.type) {
		case types.LOGIN:
			return {
				...state,
				current: action.data.user,
				logged_in: true,
			};

		case types.LOGOUT:
			return {
				...state,
				current: false,
				logged_in: false,
				credentials: false,
			};

		case types.GET_REQUESTS:
			return {
				...state,
				requests: action.requests,
			};

		case types.GET_REVIEWS:
			return {
				...state,
				reviews: {
					...state.reviews,
					[action.id]: action.reviews,
				},
			};

		default:
			return state;
	}
}
