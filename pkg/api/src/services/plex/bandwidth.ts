import axios from 'axios';

import loggerMain from '@/infra/logger/logger';
import MakePlexURL from '@/services/plex/util';

const logger = loggerMain.child({ module: 'plex.bandwidth' });

function timeDifference(previous) {
  const now = new Date();
  const current = Math.round(now.getTime() / 1000);
  previous = new Date(previous);
  const msPerMinute = 60;
  const msPerHour = msPerMinute * 60;

  const elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return `${Math.round(elapsed)}s`;
  }
  if (elapsed < msPerHour) {
    const minutes = Math.floor(elapsed / msPerMinute);
    const seconds = elapsed - minutes * 60;
    if (minutes === 2 && seconds > 1) return false;
    return `${minutes}m${seconds}s`;
  }
  return current;
}

export default async () => {
  const url = MakePlexURL('/statistics/bandwidth', {
    timespan: 6,
  }).toString();

  try {
    const res = await axios.get(url);
    const data: any = {};
    const bWidth: any = [];
    res.data.MediaContainer.StatisticsBandwidth.forEach((el) => {
      const type = el.lan ? 'Local' : 'Remote';
      const timestamp = el.at;
      if (data[timestamp]) {
        data[timestamp][type] += el.bytes * 8;
      } else {
        const time = timeDifference(timestamp);
        if (!time) return;
        data[timestamp] = {};
        data[timestamp].name = time;
        data[timestamp].Local = 0;
        data[timestamp].Remote = 0;
        data[timestamp][type] = el.bytes * 8;
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
  } catch (err) {
    logger.error(`failed to get plex bandwith statistics`, err);
  }
};
