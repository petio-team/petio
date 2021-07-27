import request from "xhr-request";
import axios from "axios";

// Config
import getConfig from "../util/config";

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

export default getBandwidth;
