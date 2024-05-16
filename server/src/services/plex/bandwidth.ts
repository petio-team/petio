import loggerMain from '@/infrastructure/logger/logger';
import { PlexClient } from '@/infrastructure/plex';
import { MediaServerEntity } from '@/resources/media-server/entity';
import { getPlexClient } from '@/services/plex/client';

const logger = loggerMain.child({ module: 'plex.bandwidth' });

export type GetBandwidthResource = {
  MediaContainer: {
    size: number;
    Device: Array<{
      id: number;
      name: string;
      platform: string;
      clientIdentifier: string;
      createdAt: number;
    }>;
    Account: Array<{
      id: number;
      key: string;
      name: string;
      defaultAudioLanguage: string;
      autoSelectAudio: boolean;
      defaultSubtitleLanguage: string;
      subtitleMode: number;
      thumb: string;
    }>;
    StatisticsBandwidth: Array<{
      accountID: number;
      deviceID: number;
      timespan: number;
      at: number;
      lan: boolean;
      bytes: number;
    }>;
  };
};

export const getBandwidthResource = (client: PlexClient) =>
  client.request.request<GetBandwidthResource>({
    method: 'GET',
    url: '/statistics/bandwidth',
    query: {
      timespan: '6',
    },
    errors: {
      400: 'Bad Request - A parameter was not specified, or was specified incorrectly.',
      401: 'Unauthorized - Returned if the X-Plex-Token is missing from the header or query.',
    },
  });

function timeDifference(prev) {
  let previous = prev;
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

export default async (server: MediaServerEntity) => {
  try {
    const client = getPlexClient(server);
    const res = await getBandwidthResource(client);
    const data: any = {};
    const bWidth: any = [];
    res.MediaContainer.StatisticsBandwidth.forEach((el) => {
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
    if (bWidth.length > 30) {
      bWidth.length = 30;
    }
    bWidth.reverse();
    return bWidth;
  } catch (err) {
    logger.error(`failed to get plex bandwith statistics`, err);
    return {};
  }
};
