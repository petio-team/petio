const express = require('express');
const path = require('path');
const admin = express();
const frontend = express();
const open = require('open');
const { exec } = require('child_process');

// function installPackages() {
// 	console.log('Installing Packages: API');
// 	return new Promise(async (resolve) => {
// 		exec('npm install --prefix ./api/', (err, stout, sterr) => {
// 			console.log('Installing Packages: API .... Complete');
// 			resolve(err ? stout : sterr);
// 		});
// 	});
// }

init();

async function start() {
	// await installPackages();
	// const api = exec(
	// 	'npm start --prefix ./api/',
	// 	function (err, stdout, stderr) {
	// 		if (err) {
	// 			throw err;
	// 		}
	// 	}
	// );

	api.stdout.on('data', function (data) {
		console.log('API Log: ' + data.toString());
	});

	api.stderr.on('data', function (data) {
		console.log('API Err: ' + data.toString());
	});

	api.on('exit', function (code) {
		console.log('API exited with code ' + code.toString());
	});

	setTimeout(() => {
		init();
	}, 2000);
}

function init() {
	let project_folder = __dirname;
	let adminDir = path.join(project_folder, './admin/build');
	let frontendDir = path.join(project_folder, './frontend/build');

	admin.use(express.static(adminDir));
	admin.get('/', function (req, res) {
		res.sendFile(adminDir);
	});
	admin.listen(32650);
	// open('http://localhost:32650');

	frontend.use(express.static(frontendDir));
	frontend.get('/', function (req, res) {
		res.sendFile(frontendDir);
	});
	frontend.listen(32700);
}
