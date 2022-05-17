import axios from "axios";

export default async (prot, ip, port, token) => {
  let url = `${prot}://${ip}:${port}/system?X-Plex-Token=${token}`;
  try {
    let res = await axios.get(url);
    return res.status;
  } catch (e) {
    // Do nothing
  }
};
