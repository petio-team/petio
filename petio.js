const express = require('express');
const path = require('path');
const app = express();
const open = require('open');
const API = require('./api/app');

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
	}

	user() {
		const fePath = path.join(
			path.dirname(process.execPath),
			'./views/frontend'
		);
		app.use('/', express.static(fePath));
	}
}

const wrapper = new Wrapper();
wrapper.init();
