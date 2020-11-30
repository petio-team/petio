import { store } from '../store';
import * as types from '../actionTypes';
import * as api from './api';
// import { get } from 'lodash';

const plex_oauth_loader =
	'<style>' +
	'.login-loader-container {' +
	'font-family: "Open Sans", Arial, sans-serif;' +
	'position: absolute;' +
	'top: 0;' +
	'right: 0;' +
	'bottom: 0;' +
	'left: 0;' +
	'}' +
	'.login-loader-message {' +
	'color: #282A2D;' +
	'text-align: center;' +
	'position: absolute;' +
	'left: 50%;' +
	'top: 25%;' +
	'transform: translate(-50%, -50%);' +
	'}' +
	'.login-loader {' +
	'border: 5px solid #ccc;' +
	'-webkit-animation: spin 1s linear infinite;' +
	'animation: spin 1s linear infinite;' +
	'border-top: 5px solid #282A2D;' +
	'border-radius: 50%;' +
	'width: 50px;' +
	'height: 50px;' +
	'position: relative;' +
	'left: calc(50% - 25px);' +
	'}' +
	'@keyframes spin {' +
	'0% { transform: rotate(0deg); }' +
	'100% { transform: rotate(360deg); }' +
	'}' +
	'</style>' +
	'<div class="login-loader-container">' +
	'<div class="login-loader-message">' +
	'<div class="login-loader"></div>' +
	'<br>' +
	'Redirecting to the Plex login page...' +
	'</div>' +
	'</div>';

export function plexAuth(plexWindow) {
	plexWindow.document.body.innerHTML = plex_oauth_loader;
	api.getPins()
		.then((response) => response.json())
		.then((res) => {
			plexWindow.location.href = `https://app.plex.tv/auth/#!?clientID=df9e71a5-a6cd-488e-8730-aaa9195f7435&code=${res.code}`;

			waitForPin(plexWindow, res.id);
		})
		.catch(() => {
			alert(
				'Unable to open popout window, please make sure to allow pop-ups!'
			);
		});
}

function saveToken(token) {
	finalise({
		type: types.PLEX_TOKEN,
		token: token,
	});
}

async function waitForPin(plexWindow, id) {
	let response = await api.validatePin(id);
	console.log(response);
	if (response.authToken) {
		plexWindow.close();
		saveToken(response.authToken);
	} else if (plexWindow.closed) {
		alert('Unable to login please try again');
	} else {
		setTimeout(() => {
			waitForPin(plexWindow, id);
		}, 1000);
	}
}

// function waitForPin(plexWindow, id) {
// 	if (plexWindow.closed) {
// 		return validatePin(id);
// 	} else {
// 		setTimeout(() => {
// 			waitForPin(plexWindow, id);
// 		}, 1000);
// 	}
// }

function finalise(data = false) {
	if (!data) return false;
	return store.dispatch(data);
}

// Credit Tautulli

// function PopupCenter(url, title, w, h) {
// 	// Fixes dual-screen position                         Most browsers      Firefox
// 	var dualScreenLeft =
// 		window.screenLeft != undefined ? window.screenLeft : window.screenX;
// 	var dualScreenTop =
// 		window.screenTop != undefined ? window.screenTop : window.screenY;

// 	var width = window.innerWidth
// 		? window.innerWidth
// 		: document.documentElement.clientWidth
// 		? document.documentElement.clientWidth
// 		: screen.width;
// 	var height = window.innerHeight
// 		? window.innerHeight
// 		: document.documentElement.clientHeight
// 		? document.documentElement.clientHeight
// 		: screen.height;

// 	var left = width / 2 - w / 2 + dualScreenLeft;
// 	var top = height / 2 - h / 2 + dualScreenTop;
// 	var newWindow = window.open(
// 		url,
// 		title,
// 		'scrollbars=yes, width=' +
// 			w +
// 			', height=' +
// 			h +
// 			', top=' +
// 			top +
// 			', left=' +
// 			left
// 	);

// 	// Puts focus on the newWindow
// 	if (window.focus) {
// 		newWindow.focus();
// 	}

// 	return newWindow;
// }
