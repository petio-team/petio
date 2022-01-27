import store from '../redux/store.js';

export function storePosition(path, scrollPos, carousels = {}, state = false) {
	updateStore({
		type: 'pos/store',
		path: path,
		scroll: scrollPos,
		carousels: carousels,
		state: state,
	});
}

function updateStore(data = false) {
	if (!data) return false;
	return store.dispatch(data);
}
