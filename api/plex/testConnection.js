const request = require("xhr-request");

// Config

function testConnection(prot, ip, port, token) {
  return new Promise((resolve, reject) => {
    let url = `${prot}://${ip}:${port}/system?X-Plex-Token=${token}`;
    request(
      url,
      {
        method: "GET",
        timeout: 10000,
      },
      function (err, data, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res.statusCode);
      }
    );
  });
}

module.exports = testConnection;
