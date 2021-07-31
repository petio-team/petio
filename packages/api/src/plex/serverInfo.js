import axios from "axios";

// Config
import getConfig from "../util/config";

async function getServerInfo() {
  const prefs = getConfig();
  let url = `${prefs.plexProtocol}://${prefs.plexIp}:${prefs.plexPort}/statistics/resources?timespan=6&X-Plex-Token=${prefs.plexToken}`;
  try {
    let res = await axios.get(url);
    return res.data;
  } catch (e) {
    // Do nothing
  }
}

export default getServerInfo;
