import { asParameters } from '@zodios/core';
import { z } from 'zod';

export const VideosParams = asParameters([
  {
    name: 'language',
    type: 'Query',
    schema: z.string().optional(),
  },
]);
