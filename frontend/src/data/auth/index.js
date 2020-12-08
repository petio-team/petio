import { store } from '../store';
import * as types from '../actionTypes';

const PlexRequestApi = `${window.location.protocol}//${window.location.host}/api`;

export function initAuth() {
	finalise({
		type: types.CREDENTIALS,
		credentials: {
			api: PlexRequestApi,
		},
	});
}

export function getAuth() {
	return store.getState().user.credentials;
}

function finalise(data = false) {
	if (!data) return false;
	return store.dispatch(data);
}
