import { store } from '../store';
import * as types from '../actionTypes';
import * as api from './api';
import { initAuth } from '../auth';

export function login(user, cookie = false) {
	return new Promise((resolve, reject) => {
		let username = user;
		let authToken = false;
		if (cookie) {
			authToken = localStorage.getItem('loggedin');
		}

		api.login(username, authToken)
			.then((data) => {
				if (data.user) {
					let ls_user = data.token;
					if (data.loggedIn) {
						if (!cookie) {
							localStorage.setItem('loggedin', ls_user);
						}
						finalise({
							type: types.LOGIN,
							data: data,
						});
						resolve(data);
					} else {
						alert('Invalid Login');
						resolve({ error: 'User not found' });
						return;
					}
				} else {
					resolve({ error: 'User not found' });
				}
			})
			.catch((err) => {
				alert(err);
				reject('Error');
			});
	});
}

export function logout() {
	finalise({
		type: types.LOGOUT,
	});
	initAuth();
}

export function request(req, user) {
	return new Promise((resolve, reject) => {
		api.request(req, user).then((data) => {
			if (data && !data.error) {
				resolve(
					finalise({
						type: types.GET_REQUESTS,
						requests: data,
					})
				);
			} else {
				reject('Error');
			}
		});
	});
}

export function getRequests() {
	return new Promise((resolve, reject) => {
		api.getRequests().then((data) => {
			if (data && !data.error) {
				resolve(
					finalise({
						type: types.GET_REQUESTS,
						requests: data,
					})
				);
			} else {
				reject('Error');
			}
		});
	});
}

export function getReviews(id) {
	return new Promise((resolve, reject) => {
		api.getReviews(id).then((data) => {
			if (data && !data.error) {
				resolve(
					finalise({
						type: types.GET_REVIEWS,
						reviews: data,
						id: id,
					})
				);
			} else {
				reject('Error');
			}
		});
	});
}

function finalise(data = false) {
	if (!data) return false;
	return store.dispatch(data);
}

export function review(item, id, review) {
	api.review(item, id, review);
}
