import { asApi } from '@zodios/core';
import { z } from 'zod';

export const HistorySchema = z.object({
  MediaContainer: z.object({
    size: z.number(),
    totalSize: z.number().optional(),
    offset: z.number().optional(),
    Metadata: z.array(
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
        originallyAvailableAt: z.string(),
        viewedAt: z.number(),
        accountID: z.number(),
        deviceID: z.number(),
      }),
    ),
  }),
});
export type History = z.infer<typeof HistorySchema>;

export const HistoryEndpoint = asApi([
  {
    description: 'gets history of the played media',
    method: 'get',
    path: '/status/sessions/history/all',
    parameters: [
      {
        description: 'the start point of where to return data from',
        name: 'x-plex-container-start',
        type: 'Header',
        schema: z.number().positive().optional(),
      },
      {
        description: 'the amount of data to return',
        name: 'x-plex-container-size',
        type: 'Header',
        schema: z.number().positive().optional(),
      },
    ],
    response: HistorySchema,
  },
]);
