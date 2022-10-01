import { asApi } from '@zodios/core';
import { z } from 'zod';

export const QueueSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  sortKey: z.string(),
  sortDirection: z.string(),
  totalRecords: z.number(),
  records: z.array(
    z.object({
      artistId: z.number(),
      albumId: z.number(),
      quality: z.object({
        quality: z.object({ id: z.number(), name: z.string() }),
        revision: z.object({
          version: z.number(),
          real: z.number(),
          isRepack: z.boolean(),
        }),
      }),
      size: z.number(),
      title: z.string(),
      sizeleft: z.number(),
      timeleft: z.string(),
      estimatedCompletionTime: z.string(),
      status: z.string(),
      trackedDownloadStatus: z.string(),
      trackedDownloadState: z.string(),
      statusMessages: z.array(
        z.object({ title: z.string(), messages: z.array(z.string()) }),
      ),
      downloadId: z.string(),
      protocol: z.string(),
      downloadClient: z.string(),
      indexer: z.string(),
      outputPath: z.string(),
      downloadForced: z.boolean(),
      id: z.number(),
    }),
  ),
});
export type Queue = z.infer<typeof QueueSchema>;

export const QueueEndpoint = asApi([
  {
    method: 'get',
    path: '/api/v1/queue',
    parameters: [
      {
        name: 'page',
        type: 'Query',
        schema: z.number().optional(),
      },
    ],
    response: QueueSchema,
  },
] as const);
