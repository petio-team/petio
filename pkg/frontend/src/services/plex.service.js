import { post } from '../helpers';
import store from '../redux/store.js';
import { login } from './user.service';

const plexHeaders = {
	'Content-Type': 'application/json',
	Accept: 'application/json',
	'X-Plex-Device': 'API',
	'X-Plex-Device-Name': 'Petio',
	'X-Plex-Product': 'Petio',
	'X-Plex-Version': 'v1.0',
	'X-Plex-Platform-Version': 'v1.0',
	'X-Plex-Client-Identifier': 'fc684eb1-cdff-46cc-a807-a3720696ae9f',
};

function timeout(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function getPins() {
	let url = 'https://plex.tv/api/v2/pins?strong=true';
	let method = 'post';
	let headers = plexHeaders;
	return process(url, headers, method).then((response) => response.json());
}

function validatePin(id) {
	let url = `https://plex.tv/api/v2/pins/${id}`;
	let method = 'get';
	let headers = plexHeaders;
	return process(url, headers, method).then((response) => response.json());
}

async function waitForPin(plexWindow, id, setup = false, login = false) {
	await timeout(1000);
	let response = await validatePin(id);
	if (response.authToken) {
		plexWindow.close();
		if (setup) {
			updateStore({
				type: 'user/plex-token',
				token: response.authToken,
			});
			getUserFromToken(response.authToken);
			return;
		} else if (login) {
			let data = await plexLogin(response.authToken);
			if (data.user) {
				if (data.loggedIn) {
					updateStore({
						type: 'user/set-current-user',
						user: data,
					});
					return data;
				} else {
					return {
						error: 'User not found',
					};
				}
			} else {
				return {
					error: 'User not found',
				};
			}
		} else {
			updateStore({
				type: 'user/plex-token',
				token: response.authToken,
			});
			window.location.reload();
		}
	} else if (plexWindow.closed) {
		return {
			error: 'Plex window closed',
		};
	} else {
		return await waitForPin(plexWindow, id, setup, login);
	}
}

export async function plexAuth(plexWindow) {
	let pins = await getPins();
	plexWindow.location.href = `https://app.plex.tv/auth/#!?clientID=fc684eb1-cdff-46cc-a807-a3720696ae9f&code=${pins.code}`;
	let data = await waitForPin(plexWindow, pins.id, true, false);
	return data;
}

export async function plexAuthLogin(plexWindow) {
	let pins = await getPins();
	plexWindow.location.href = `https://app.plex.tv/auth/#!?clientID=fc684eb1-cdff-46cc-a807-a3720696ae9f&code=${pins.code}`;
	let data = await waitForPin(plexWindow, pins.id, false, true);
	return data;
}

async function getUserFromToken(token) {
	let setup = {
		user: {},
		servers: {},
	};
	let user = await getUser(token);
	let [servers, serversSsl] = await Promise.all([
		getServers(token),
		getServers(token, true),
	]);
	let serverList = Array.prototype.slice.call(
		servers
			.getElementsByTagName('MediaContainer')[0]
			.getElementsByTagName('Device')
	);
	let serverListSsl = Array.prototype.slice.call(
		serversSsl
			.getElementsByTagName('MediaContainer')[0]
			.getElementsByTagName('Device')
	);
	Array.prototype.push.apply(serverList, serverListSsl);
	let userData = user.getElementsByTagName('user')[0];
	setup.user.email = userData.getAttribute('email');
	setup.user.id = userData.getAttribute('id');
	setup.user.username = userData.getAttribute('title');
	setup.user.thumb = userData.getAttribute('thumb');
	for (let server of serverList) {
		let i = 0;
		if (
			server.getAttribute('owned') === '1' &&
			server.getAttribute('provides') === 'server'
		) {
			let connections = server.getElementsByTagName('Connection');

			for (let connection of connections) {
				console.log(connection);
				let uri = connection.getAttribute('uri');
				let details = getUrlDetails(uri);
				setup.servers[
					server.getAttribute('clientIdentifier') +
						details.hostname +
						i
				] = {
					name: server.getAttribute('name'),
					host: details.hostname,
					port: connection.getAttribute('port'),
					protocol: details.protocol,
					platform: server.getAttribute('platform'),
					status: 'pending',
					clientId: server.getAttribute('clientIdentifier'),
				};
				i++;
			}
		}
	}
	setup.servers['plex_docker'] = {
		name: 'Docker',
		host: 'plex',
		port: '32400',
		protocol: 'http',
		platform: 'docker',
		status: 'pending',
	};
	console.log(setup.servers);
	updateStore({
		type: 'user/plex-details',
		servers: setup.servers,
		user: setup.user,
	});

	testPlexServers(setup.servers, token);
}

function testPlexServers(servers, token) {
	Object.keys(servers).forEach((key) => {
		let server = servers[key];
		server.token = token;
		testPlexServer(server, key);
	});
}

async function testPlexServer(server, key) {
	try {
		let test = await testServer(server);
		console.log(test);
		server.status = test.status;
		updateStore({
			type: 'user/plex-server',
			key: key,
			server: server,
		});
	} catch (e) {
		console.log(e);
		server.status = 'failed';
		updateStore({
			type: 'user/plex-server',
			key: key,
			server: server,
		});
	}
}

function getUser(token) {
	let url = `https://plex.tv/users/account?X-Plex-Token=${token}`;
	let method = 'get';
	let headers = plexHeaders;
	return process(url, headers, method)
		.then((response) => response.text())
		.then((str) => new window.DOMParser().parseFromString(str, 'text/xml'));
}

function getServers(token, ssl = false) {
	let url = `https://plex.tv/pms/resources?${
		ssl ? 'includeHttps=1&' : ''
	}X-Plex-Token=${token}`;
	let method = 'get';
	let headers = plexHeaders;
	return process(url, headers, method)
		.then((response) => response.text())
		.then((str) => new window.DOMParser().parseFromString(str, 'text/xml'));
}

async function plexLogin(token = false) {
	try {
		const login = await post('/login/plex_login', { token: token });
		if (!login.loggedIn) throw 'Invalid login credentials';
		updateStore({
			type: 'user/set-current-user',
			user: login.user,
			admin: login.admin,
		});
		return login;
	} catch (e) {
		console.log(e);
		return login;
	}
}

function testServer(server) {
	return post(`/setup/test_server`, { server });
}

function updateStore(data = false) {
	if (!data) return false;
	return store.dispatch(data);
}

function getUrlDetails(url) {
	var a = document.createElement('a');
	a.href = url;
	return {
		protocol: a.protocol.replace(':', ''),
		hostname: a.hostname,
		port: a.port,
	};
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