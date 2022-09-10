import { asApi } from '@zodios/core';

import { Parameters } from './params';
import { MovieSchema } from './schema';

export const MovieAPI = asApi([
  {
    method: 'get',
    path: '/discover/movie',
    parameters: Parameters,
    response: MovieSchema,
  },
]);
