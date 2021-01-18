const request = require("xhr-request");

// Config
const getConfig = require("../util/config");

function getBandwidth() {
  const prefs = getConfig();
  return new Promise((resolve, reject) => {
    let url = `${prefs.plexProtocol}://${prefs.plexIp}:${prefs.plexPort}/statistics/bandwidth?timespan=6&X-Plex-Token=${prefs.plexToken}`;
    request(
      url,
      {
        method: "GET",
        json: true,
      },
      function (err, data) {
        if (err) {
          reject(err);
        }
        resolve(data);
      }
    );
  });
}

module.exports = getBandwidth;
