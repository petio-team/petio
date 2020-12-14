const express = require('express');
const path = require('path');
const app = express();
const open = require('open');
// const admin = app();
// const frontend = app();
// const API = require('./api/app');

class Wrapper {
	init() {
		console.log('running');
		this.admin();
		this.user();
		app.listen(7777);
		open('http://localhost:7777/admin/');
	}

	admin() {
		const adminPath = path.join(
			path.dirname(process.execPath),
			'./views/admin'
		);
		app.use('/admin/', express.static(adminPath));
		// app.get('/admin/', function (req, res) {
		// 	res.sendFile(adminPath);
		// });
	}

	user() {
		const fePath = path.join(
			path.dirname(process.execPath),
			'./views/frontend'
		);
		app.use('/', express.static(fePath));
		// app.get('/', function (req, res) {
		// 	res.sendFile(fePath);
		// });
	}
}

const wrapper = new Wrapper();
wrapper.init();

// init();

// function init() {
// 	// let project_folder = __dirname;
// 	// let adminDir = path.join(project_folder, './admin/build');
// 	// let frontendDir = path.join(project_folder, './frontend/build');

// 	// admin.use(app.static(adminDir));
// 	// admin.get('/', function (req, res) {
// 	// 	res.sendFile(adminDir);
// 	// });
// 	// admin.listen(32650);
// 	// // open('http://localhost:32650');

// 	// frontend.use(app.static(frontendDir));
// 	// frontend.get('/', function (req, res) {
// 	// 	res.sendFile(frontendDir);
// 	// });
// 	// frontend.listen(32700);
// }
