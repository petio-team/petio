const express = require('express');
const path = require('path');
// const admin = express();
// const frontend = express();
const API = require('./api/app');

class Wrapper {
	constructor() {
		this.api = API;
	}

	init() {
		console.log('running');
	}
}

// init();

// function init() {
// 	// let project_folder = __dirname;
// 	// let adminDir = path.join(project_folder, './admin/build');
// 	// let frontendDir = path.join(project_folder, './frontend/build');

// 	// admin.use(express.static(adminDir));
// 	// admin.get('/', function (req, res) {
// 	// 	res.sendFile(adminDir);
// 	// });
// 	// admin.listen(32650);
// 	// // open('http://localhost:32650');

// 	// frontend.use(express.static(frontendDir));
// 	// frontend.get('/', function (req, res) {
// 	// 	res.sendFile(frontendDir);
// 	// });
// 	// frontend.listen(32700);
// }
