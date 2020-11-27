const fs = require('fs');
const path = require('path');

let project_folder, configFile;
if (process.pkg) {
	project_folder = path.dirname(process.execPath);
	configFile = path.join(project_folder, './config.json');
} else {
	project_folder = __dirname;
	configFile = path.join(project_folder, '../config.json');
}

let user_config = false;
try {
	user_config = fs.readFileSync(configFile);
} catch (err) {
	console.log('Config Not Found! Exiting');
}

module.exports = user_config;
