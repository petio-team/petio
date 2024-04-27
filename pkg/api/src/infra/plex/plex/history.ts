import { makeApi } from '@zodios/core';
import { z } from 'zod';

export const HistorySchema = z.object({
  MediaContainer: z.object({
    size: z.number(),
    totalSize: z.number().optional(),
    offset: z.number().optional(),
    Metadata: z
      .array(
        z.object({
          historyKey: z.string(),
          key: z.string(),
          ratingKey: z.string(),
          librarySectionID: z.string(),
          parentKey: z.string().optional(),
          grandparentKey: z.string().optional(),
          title: z.string(),
          grandparentTitle: z.string().optional(),
          type: z.string(),
          thumb: z.string(),
          parentThumb: z.string().optional(),
          grandparentThumb: z.string().optional(),
          grandparentArt: z.string().optional(),
          index: z.number().optional(),
          parentIndex: z.number().optional(),
          originallyAvailableAt: z.string().optional(),
          viewedAt: z.number(),
          accountID: z.number(),
          deviceID: z.number(),
        }),
      )
      .optional(),
  }),
});
export type History = z.infer<typeof HistorySchema>;

export const HistoryEndpoint = makeApi([
  {
    description: 'gets history of the played media',
    method: 'get',
    path: '/status/sessions/history/all',
    parameters: [
      {
        description: 'starting position for items',
        name: 'X-Plex-Container-Start',
        type: 'Header',
        schema: z.number().default(0),
      },
      {
        description: 'amount of items to return at once',
        name: 'X-Plex-Container-Size',
        type: 'Header',
        schema: z.number().positive().default(100),
      },
      {
        description: 'get content viewed after a specific timestamp',
        name: 'viewedAt>',
        type: 'Query',
        schema: z.number().optional(),
      },
      {
        description: 'sort the results by',
        name: 'sort',
        type: 'Query',
        schema: z.enum(['viewedAt:desc', 'viewedAt:asc']).optional(),
      },
      {
        description: 'account ID associated with the history',
        name: 'accountID',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        description: 'library section ID associated with the history',
        name: 'librarySectionID',
        type: 'Query',
        schema: z.number().optional(),
      },
    ],
    response: HistorySchema,
    errors: [
      {
        status: 400,
        description: 'History for user not found',
        schema: z.any(),
      },
    ],
  },
]);
