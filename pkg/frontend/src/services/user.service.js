import { get, post } from '../helpers';
import cookies from 'js-cookie';
import store from '../redux/store.js';

// user actions

export function getToken() {
	return cookies.get('petio_jwt');
}

export function clearToken() {
	cookies.set('petio_jwt', '', { expires: new Date(0) });
}

export async function login(user, token = false) {
	if (!user && !token) throw 'User not supplied';
	try {
		const login = await post('/login', { user, authToken: false });
		if (!login.loggedIn) throw 'Invalid login credentials';
		updateStore({
			type: 'user/set-current-user',
			user: login.user,
			admin: login.admin,
		});
		return login;
	} catch (e) {
		throw e;
	}
}

export async function getRequests() {
	try {
		const data = await get('/request/min');
		updateStore({ type: 'user/update-requests', requests: data });
		return data;
	} catch (e) {
		console.log(e);
	}
}

export async function myRequests() {
	try {
		const data = await get('/request/me');
		updateStore({ type: 'user/my-requests', requests: data });
		return data;
	} catch (e) {
		console.log(e);
	}
}

export async function myRequestsArchive(id) {
	if (!id) return;
	try {
		const data = await get(`/request/archive/${id}`);
		updateStore({
			type: 'user/my-requests-archive',
			requests: data.requests,
		});
		return data;
	} catch (e) {
		console.log(e);
	}
}

export async function addNewRequest(req, user) {
	return post('/request/add', { request: req, user });
}

function updateStore(data = false) {
	if (!data) return false;
	return store.dispatch(data);
}
