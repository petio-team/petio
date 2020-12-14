const fs = require('fs');
const path = require('path');

function getConfig() {
	let project_folder, configFile;
	if (process.pkg) {
		project_folder = path.dirname(process.execPath);
		configFile = path.join(project_folder, './config/config.json');
	} else {
		project_folder = __dirname;
		configFile = path.join(project_folder, '../config/config.json');
	}

	let userConfig = false;
	try {
		userConfig = fs.readFileSync(configFile);
		return JSON.parse(userConfig);
	} catch (err) {
		console.log('Config Not Found! Exiting');
		return false;
	}
}

module.exports = getConfig;
