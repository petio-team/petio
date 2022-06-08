import { z } from 'zod';

import { WatchMonetizationType } from '../types';
import { SortByType } from './types';

export const Parameters = [
  {
    name: 'language',
    type: 'Query',
    schema: z.string().optional(),
  },
  {
    name: 'sort_by',
    type: 'Query',
    schema: z.nativeEnum(SortByType).optional(),
  },
  {
    name: 'region',
    type: 'Query',
    schema: z.string().optional(),
  },
  {
    name: 'certification_country',
    type: 'Query',
    schema: z.string().optional(),
  },
  {
    name: 'certification',
    type: 'Query',
    schema: z.string().optional(),
  },
  {
    name: 'certification.lte',
    type: 'Query',
    schema: z.string().optional(),
  },
  {
    name: 'certification.gte',
    type: 'Query',
    schema: z.string().optional(),
  },
  {
    name: 'include_adult',
    type: 'Query',
    schema: z.boolean().optional(),
  },
  {
    name: 'page',
    type: 'Query',
    schema: z.number().min(1).max(1000).optional(),
  },
  {
    name: 'primary_release_year',
    type: 'Query',
    schema: z.number().optional(),
  },
  {
    name: 'primary_release_date.gte',
    type: 'Query',
    schema: z.string().optional(),
  },
  {
    name: 'primary_release_date.lte',
    type: 'Query',
    schema: z.string().optional(),
  },
  {
    name: 'release_date.gte',
    type: 'Query',
    schema: z.string().optional(),
  },
  {
    name: 'release_date.lte',
    type: 'Query',
    schema: z.string().optional(),
  },
  {
    name: 'with_release_type',
    type: 'Query',
    schema: z.number().optional(),
  },
  {
    name: 'year',
    type: 'Query',
    schema: z.number().optional(),
  },
  {
    name: 'vote_count.gte',
    type: 'Query',
    schema: z.number().optional(),
  },
  {
    name: 'vote_count.lte',
    type: 'Query',
    schema: z.number().optional(),
  },
  {
    name: 'vote_average.gte',
    type: 'Query',
    schema: z.number().optional(),
  },
  {
    name: 'vote_average.lte',
    type: 'Query',
    schema: z.number().optional(),
  },
  {
    name: 'with_cast',
    type: 'Query',
    schema: z.string().optional(),
  },
  {
    name: 'with_crew',
    type: 'Query',
    schema: z.string().optional(),
  },
  {
    name: 'with_people',
    type: 'Query',
    schema: z.string().optional(),
  },
  {
    name: 'with_companies',
    type: 'Query',
    schema: z.string().optional(),
  },
  {
    name: 'with_genres',
    type: 'Query',
    schema: z.string().optional(),
  },
  {
    name: 'without_genres',
    type: 'Query',
    schema: z.string().optional(),
  },
  {
    name: 'with_keywords',
    type: 'Query',
    schema: z.string().optional(),
  },
  {
    name: 'without_keywords',
    type: 'Query',
    schema: z.string().optional(),
  },
  {
    name: 'with_runtime.gte',
    type: 'Query',
    schema: z.number().optional(),
  },
  {
    name: 'with_runtime.lte',
    type: 'Query',
    schema: z.number().optional(),
  },
  {
    name: 'with_original_language',
    type: 'Query',
    schema: z.string().optional(),
  },
  {
    name: 'with_watch_providers',
    type: 'Query',
    schema: z.string().optional(),
  },
  {
    name: 'watch_region',
    type: 'Query',
    schema: z.string().optional(),
  },
  {
    name: 'with_watch_monetization_types',
    type: 'Query',
    schema: z.nativeEnum(WatchMonetizationType).optional(),
  },
  {
    name: 'without_companies',
    type: 'Query',
    schema: z.string().optional(),
  },
] as const;
