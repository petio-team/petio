export default function (
	state = {
		pages: {},
	},
	action
) {
	switch (action.type) {
		case 'pos/store':
			return {
				...state,
				pages: {
					...state.pages,
					[action.path]: {
						state: action.state,
						scroll: action.scroll,
						carousels: action.carousels,
					},
				},
			};

		case 'pos/clear':
			return {
				...state,
				pages: {},
			};

		default:
			return state;
	}
}
