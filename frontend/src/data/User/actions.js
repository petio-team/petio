import { store } from '../store';
import * as types from '../actionTypes';
import * as api from './api';
import { initAuth } from '../auth';

export function login(user, pass = false, cookie = false, admin) {
	return new Promise((resolve, reject) => {
		let username = user,
			password = pass;
		let authToken = false;
		if (cookie) {
			let ls_raw = localStorage.getItem('loggedin');
			let parsed = window.atob(ls_raw);
			if (admin) {
				authToken = parsed;
			} else {
				username = parsed;
			}
		}

		api.login(username, password, admin, authToken)
			.then((data) => {
				if (data.user) {
					let ls_user = window.btoa(data.user.title);
					if (data.admin) {
						data.user.admin = true;
						ls_user = window.btoa(data.user.authToken);
						localStorage.setItem('adminloggedin', true);
					} else {
						localStorage.setItem('adminloggedin', false);
					}
					if (data.loggedIn || data.admin) {
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
