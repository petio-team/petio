const plexHeaders = {
	'Content-Type': 'application/json',
	Accept: 'application/json',
	'X-Plex-Device': 'API',
	'X-Plex-Device-Name': 'DeviceName',
	'X-Plex-Product': 'MediaButler',
	'X-Plex-Version': 'v1.0',
	'X-Plex-Platform-Version': 'v1.0',
	'X-Plex-Client-Identifier': 'df9e71a5-a6cd-488e-8730-aaa9195f7435',
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
