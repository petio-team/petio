const fs = require("fs");
const path = require("path");
const getConfig = require("./config");

function updateConfig(key, value) {
  const config = getConfig();

  let project_folder, configFile;
  if (process.pkg) {
    project_folder = path.dirname(process.execPath);
    configFile = path.join(project_folder, "./config/config.json");
  } else {
    project_folder = __dirname;
    configFile = path.join(project_folder, "../config/config.json");
  }

  const newConfig = { ...config, [key]: value };
  fs.writeFileSync(configFile, JSON.stringify(newConfig, null, 2));
}

module.exports = updateConfig;
