const axios = require("axios");

const MakePlexURL = require('./util');

async function getBandwidth() {
  const url = MakePlexURL(
    "/statistics/bandwidth",
    {
      timespan: 6,
    }
  ).toString();

  try {
    let res = await axios.get(url);
    return res.data;
  } catch (e) {
    // Do nothing
  }
}

module.exports = getBandwidth;
