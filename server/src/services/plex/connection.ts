import axios from 'axios';

export default async (prot, ip, port, token) => {
  const url = `${prot}://${ip}:${port}/system?X-Plex-Token=${token}`;
  try {
    const res = await axios.get(url);
    return res.status;
  } catch (e) {
    // Do nothing
    return -1;
  }
};
