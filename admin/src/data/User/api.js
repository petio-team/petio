const apiUrl = 'http://localhost:32600';

export function login(username, password, admin = false, token = false) {
	let request = `${apiUrl}/login`;
	let headers = {
		'Content-Type': 'application/json',
	};
	return process(request, 'post', headers, {
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
	return process(request, 'get', headers).then((res) => res.json());
};

function process(url, method, headers, body = null) {
	let args = {
		headers: headers,
		method: method,
	};

	if (method === 'post') {
		args.body = JSON.stringify(body);
	}

	return fetch(url, args);
}
