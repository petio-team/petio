import { URL, URLSearchParams } from 'url';

import { config } from '@/config/schema';

const MakePlexURL = (url, params = {}) => {
  const baseurl = new URL(
    url,
    `${config.get('plex.protocol')}://${config.get('plex.host')}:${config.get(
      'plex.port',
    )}`,
  );
  const prms = new URLSearchParams();

  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      prms.set(key, params[key]);
    }
  }

  prms.set('X-Plex-Token', config.get('plex.token'));
  baseurl.search = prms.toString();

  return baseurl;
};
export default MakePlexURL;
