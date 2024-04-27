import { makeApi } from '@zodios/core';

import { Parameters } from './params';
import { TVSchema } from './schema';

// eslint-disable-next-line import/prefer-default-export
export const TVAPI = makeApi([
  {
    method: 'get',
    path: '/discover/tv',
    parameters: Parameters,
    response: TVSchema,
  },
]);
