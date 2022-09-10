import { asApi } from '@zodios/core';

import { Parameters } from './params';
import { TVSchema } from './schema';

export const TVAPI = asApi([
  {
    method: 'get',
    path: '/discover/tv',
    parameters: Parameters,
    response: TVSchema,
  },
]);
