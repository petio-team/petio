import { store } from '../store';
import * as types from '../actionTypes';

const PlexRequestApi = `http://${window.location.hostname}`;
const PlexRequestApiPort = '32600';

export function initAuth() {
	fetch('./config.json')
		.then((res) => res.json())
		.then((conf) => {
			finalise({
				type: types.CREDENTIALS,
				credentials: {
					api:
						(conf.PlexRequestApi.length > 0
							? conf.PlexRequestApi
							: PlexRequestApi) +
						':' +
						conf.PlexRequestApiPort,
				},
			});
		})
		.catch(() => {
			finalise({
				type: types.CREDENTIALS,
				credentials: {
					api: PlexRequestApi + ':' + PlexRequestApiPort,
				},
			});
		});
}

export function getAuth() {
	return store.getState().user.credentials;
}

function finalise(data = false) {
	if (!data) return false;
	return store.dispatch(data);
}
