import { makeApi } from '@zodios/core';

import { VideosParams } from './params';
import { VideoSchema } from './schema';

// eslint-disable-next-line import/prefer-default-export
export const VideosAPI = makeApi([
  {
    method: 'get',
    path: '/movie/:id/videos',
    parameters: VideosParams,
    response: VideoSchema,
  },
]);
