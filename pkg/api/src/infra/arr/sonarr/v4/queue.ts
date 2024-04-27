import { makeApi } from '@zodios/core';
import { z } from 'zod';

export const QueueSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  sortKey: z.string(),
  sortDirection: z.string(),
  totalRecords: z.number(),
  records: z.array(
    z.union([
      z.object({
        seriesId: z.number(),
        episodeId: z.number(),
        languages: z.array(z.object({ id: z.number(), name: z.string() })),
        quality: z.object({
          quality: z.object({
            id: z.number(),
            name: z.string(),
            source: z.string(),
            resolution: z.number(),
          }),
          revision: z.object({
            version: z.number(),
            real: z.number(),
            isRepack: z.boolean(),
          }),
        }),
        customFormats: z.array(z.unknown()),
        size: z.number(),
        title: z.string(),
        sizeleft: z.number(),
        timeleft: z.string(),
        estimatedCompletionTime: z.string(),
        status: z.string(),
        trackedDownloadStatus: z.string(),
        trackedDownloadState: z.string(),
        statusMessages: z.array(
          z.union([
            z.object({ title: z.string(), messages: z.array(z.unknown()) }),
            z.object({ title: z.string(), messages: z.array(z.string()) }),
          ]),
        ),
        errorMessage: z.string(),
        downloadId: z.string(),
        protocol: z.string(),
        downloadClient: z.string(),
        indexer: z.string(),
        outputPath: z.string(),
        id: z.number(),
      }),
      z.object({
        seriesId: z.number(),
        episodeId: z.number(),
        languages: z.array(z.object({ id: z.number(), name: z.string() })),
        quality: z.object({
          quality: z.object({
            id: z.number(),
            name: z.string(),
            source: z.string(),
            resolution: z.number(),
          }),
          revision: z.object({
            version: z.number(),
            real: z.number(),
            isRepack: z.boolean(),
          }),
        }),
        customFormats: z.array(z.unknown()),
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
        errorMessage: z.string(),
        downloadId: z.string(),
        protocol: z.string(),
        downloadClient: z.string(),
        indexer: z.string(),
        outputPath: z.string(),
        id: z.number(),
      }),
      z.object({
        seriesId: z.number(),
        episodeId: z.number(),
        languages: z.array(z.object({ id: z.number(), name: z.string() })),
        quality: z.object({
          quality: z.object({
            id: z.number(),
            name: z.string(),
            source: z.string(),
            resolution: z.number(),
          }),
          revision: z.object({
            version: z.number(),
            real: z.number(),
            isRepack: z.boolean(),
          }),
        }),
        customFormats: z.array(z.unknown()),
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
        id: z.number(),
      }),
    ]),
  ),
});
export type Queue = z.infer<typeof QueueSchema>;

export const QueueEndpoint = makeApi([
  {
    method: 'get',
    path: '/api/v3/queue',
    parameters: [
      {
        name: 'page',
        type: 'Query',
        schema: z.number().optional(),
      },
    ],
    response: QueueSchema,
  },
]);
