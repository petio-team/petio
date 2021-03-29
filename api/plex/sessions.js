const axios = require("axios");

// Config
const getConfig = require("../util/config");

async function getSessions() {
  const prefs = getConfig();
  let url = `${prefs.plexProtocol}://${prefs.plexIp}:${prefs.plexPort}/status/sessions?X-Plex-Token=${prefs.plexToken}`;
  try {
    let res = await axios.get(url);
    return res.data;
  } catch (e) {
    // Do nothing
  }
}

module.exports = getSessions;
