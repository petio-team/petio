const request = require("xhr-request");
const axios = require("axios");

// Config
const getConfig = require("../util/config");

async function getBandwidth() {
  const prefs = getConfig();
  let url = `${prefs.plexProtocol}://${prefs.plexIp}:${prefs.plexPort}/statistics/bandwidth?timespan=6&X-Plex-Token=${prefs.plexToken}`;
  try {
    let res = await axios.get(url);
    return res.data;
  } catch (e) {
    // Do nothing
  }
}

module.exports = getBandwidth;
