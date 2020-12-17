const plexHeaders = {
	'Content-Type': 'application/json',
	Accept: 'application/json',
	'X-Plex-Device': 'API',
	'X-Plex-Device-Name': 'Petio',
	'X-Plex-Product': 'Petio',
	'X-Plex-Version': '0.1.9.1',
	'X-Plex-Platform-Version': '0.1.9.1',
	'X-Plex-Client-Identifier': '067e602b-1e86-4739-900d-1abdf8f6da71',
};

export function getPins() {
	let url = 'https://plex.tv/api/v2/pins?strong=true';
	let method = 'post';
	let headers = plexHeaders;
	return process(url, headers, method);
}

export function validatePin(id) {
	let url = `https://plex.tv/api/v2/pins/${id}`;
	let method = 'get';
	let headers = plexHeaders;
	return process(url, headers, method).then((response) => response.json());
}

export function getUser(token) {
	let url = `https://plex.tv/users/account?X-Plex-Token=${token}`;
	let method = 'get';
	let headers = plexHeaders;
	return process(url, headers, method)
		.then((response) => response.text())
		.then((str) => new window.DOMParser().parseFromString(str, 'text/xml'));
}

export function getServers(token) {
	let url = `https://plex.tv/pms/resources?X-Plex-Token=${token}`;
	let method = 'get';
	let headers = plexHeaders;
	return process(url, headers, method)
		.then((response) => response.text())
		.then((str) => new window.DOMParser().parseFromString(str, 'text/xml'));
}

function process(url, headers, method, body = null) {
	let args = {
		method: method,
		headers: headers,
	};

	if (method === 'post') {
		args.body = body;
	}

	return fetch(url, args);
}
