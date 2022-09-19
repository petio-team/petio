import axios from 'axios';

import MakePlexURL from '@/services/plex/util';

export default async () => {
  const url = MakePlexURL('/status/sessions').toString();

  try {
    const res = await axios.get(url);
    return res.data;
  } catch (e) {
    // Do nothing
  }
};
