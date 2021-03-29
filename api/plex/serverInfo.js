const axios = require("axios");

// Config
const getConfig = require("../util/config");

async function getServerInfo() {
  const prefs = getConfig();
  let url = `${prefs.plexProtocol}://${prefs.plexIp}:${prefs.plexPort}/statistics/resources?timespan=6&X-Plex-Token=${prefs.plexToken}`;
  try {
    let res = await axios.get(url);
    return res.data;
  } catch (e) {
    // Do nothing
  }
}

module.exports = getServerInfo;
