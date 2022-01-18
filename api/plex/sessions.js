const axios = require("axios");
const MakePlexURL = require('./util');

async function getSessions() {
  const url = MakePlexURL(
    "/status/sessions",
  ).toString();

  try {
    let res = await axios.get(url);
    return res.data;
  } catch (e) {
    // Do nothing
  }
}

module.exports = getSessions;
