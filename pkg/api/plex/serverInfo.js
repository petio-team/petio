const axios = require("axios");
const MakePlexURL = require("./util");

async function getServerInfo() {
  const url = MakePlexURL(
    "/statistics/resources",
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

module.exports = getServerInfo;
