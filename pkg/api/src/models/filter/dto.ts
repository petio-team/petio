import { randomUUID } from 'crypto';
import { z } from 'zod';

import { DownloaderDTO } from '../downloader/dto';

export const FilterActionsDTO = z.object({
  server: z.union([DownloaderDTO, z.string()]),
  path: z.string(),
  profile: z.string(),
  language: z.string(),
  tag: z.string(),
  type: z.string(),
});
export type FilterActions = z.infer<typeof FilterActionsDTO>;

export const FilterFiltersDTO = z.object({
  condition: z.string(),
  operator: z.string(),
  value: z.string(),
});
export type FilterFilters = z.infer<typeof FilterFiltersDTO>;

export const FilterDTO = z.object({
  id: z.string().default(randomUUID()),
  filters: FilterFiltersDTO.array(),
  actions: FilterActionsDTO,
});
export type Filter = z.infer<typeof FilterDTO>;
