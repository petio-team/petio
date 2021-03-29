const axios = require("axios");

// Config

async function testConnection(prot, ip, port, token) {
  let url = `${prot}://${ip}:${port}/system?X-Plex-Token=${token}`;
  try {
    let res = await axios.get(url);
    return res.data;
  } catch (e) {
    // Do nothing
  }
}

module.exports = testConnection;
