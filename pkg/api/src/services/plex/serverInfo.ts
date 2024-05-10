import { PlexClient } from '@/infra/plex';

export type GetStatisticsResources = {
  MediaContainer: {
    size: number;
    StatisticsResources: Array<{
      timespan: number;
      at: number;
      hostCpuUtilization: number;
      processCpuUtilization: number;
      hostMemoryUtilization: number;
      processMemoryUtilization: number;
    }>;
  };
};

export default async (
  client: PlexClient,
): Promise<GetStatisticsResources | null> => {
  try {
    return await client.request.request<GetStatisticsResources>({
      method: 'GET',
      url: '/statistics/resources',
      query: {
        timespan: '6',
      },
      errors: {
        400: 'Bad Request - A parameter was not specified, or was specified incorrectly.',
        401: 'Unauthorized - Returned if the X-Plex-Token is missing from the header or query.',
      },
    });
  } catch (e) {
    return null;
  }
};
