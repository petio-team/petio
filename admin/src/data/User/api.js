const apiUrl =
	process.env.NODE_ENV === 'development'
		? 'http://localhost:7778'
		: `${window.location.protocol}//${window.location.host}/api`;

export function login(username, password, admin = false, token = false) {
	let request = `${apiUrl}/login`;
	let headers = {
		'Content-Type': 'application/json',
	};
	return call(request, 'post', headers, {
		username: username,
		password: password,
		admin: admin,
		authToken: token,
	}).then((res) => res.json());
}

export let getRequests = () => {
	let request = `${apiUrl}/request/all`;
	let headers = {
		'Content-Type': 'application/json',
	};
	return call(request, 'get', headers).then((res) => res.json());
};

function call(url, method, headers, body = null) {
	let args = {
		headers: headers,
		method: method,
	};

	if (method === 'post') {
		args.body = JSON.stringify(body);
	}

	return fetch(url, args);
}
