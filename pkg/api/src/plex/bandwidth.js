const axios = require("axios");

const MakePlexURL = require("./util");

function timeDifference(previous) {
  let now = new Date();
  let current = Math.round(now.getTime() / 1000);
  previous = new Date(previous);
  var msPerMinute = 60;
  var msPerHour = msPerMinute * 60;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return Math.round(elapsed) + "s";
  } else if (elapsed < msPerHour) {
    let minutes = Math.floor(elapsed / msPerMinute);
    let seconds = elapsed - minutes * 60;
    if (minutes === 2 && seconds > 1) return false;
    return `${minutes}m${seconds}s`;
  } else {
    return current;
  }
}

async function getBandwidth() {
  const url = MakePlexURL("/statistics/bandwidth", {
    timespan: 6,
  }).toString();

  try {
    let res = await axios.get(url);
    let data = {};
    let bWidth = [];
    res.data.MediaContainer.StatisticsBandwidth.forEach((el) => {
      let type = el["lan"] ? "Local" : "Remote";
      let timestamp = el["at"];
      if (data[timestamp]) {
        data[timestamp][type] += el["bytes"] * 8;
      } else {
        let time = timeDifference(timestamp);
        if (!time) return;
        data[timestamp] = {};
        data[timestamp].name = time;
        data[timestamp].Local = 0;
        data[timestamp].Remote = 0;
        data[timestamp][type] = el["bytes"] * 8;
      }
    });
    Object.keys(data)
      .reverse()
      .forEach((key) => {
        bWidth.push(data[key]);
      });
    if (bWidth.length > 30) bWidth.length = 30;
    bWidth.reverse();
    return bWidth;
  } catch (e) {
    console.log(e.stack);
    // Do nothing
  }
}

module.exports = getBandwidth;
