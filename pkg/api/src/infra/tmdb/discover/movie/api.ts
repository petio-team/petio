import { makeApi } from '@zodios/core';

import { Parameters } from './params';
import { MovieSchema } from './schema';

// eslint-disable-next-line import/prefer-default-export
export const MovieAPI = makeApi([
  {
    method: 'get',
    path: '/discover/movie',
    parameters: Parameters,
    response: MovieSchema,
  },
]);
