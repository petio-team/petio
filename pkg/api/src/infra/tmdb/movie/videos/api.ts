import { asApi } from '@zodios/core';

import { VideosParams } from './params';
import { VideoSchema } from './schema';

export const VideosAPI = asApi([
  {
    method: 'get',
    path: '/movie/:id/videos',
    parameters: VideosParams,
    response: VideoSchema,
  },
]);