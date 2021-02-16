import { get, post } from "../http";

export async function login(username, password, admin = false, token = false) {
	return post(`/login`, {
		user: {
			username: username,
			password: password,
		},
		admin: admin,
		authToken: token,
	});
}

export async function getRequests(min) {
	return get(`/request/${min ? "min" : "all"}`);
}
