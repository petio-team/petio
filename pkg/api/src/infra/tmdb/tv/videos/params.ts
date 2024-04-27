import { makeParameters } from '@zodios/core';
import { z } from 'zod';

// eslint-disable-next-line import/prefer-default-export
export const VideosParams = makeParameters([
  {
    name: 'language',
    type: 'Query',
    schema: z.string().optional(),
  },
]);
