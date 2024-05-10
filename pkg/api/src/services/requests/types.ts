import { z } from 'zod';

import { MovieResource } from '@/infrastructure/servarr/radarr';
import { SeriesResource } from '@/infrastructure/servarr/sonarr';
import { MovieEntity } from '@/resources/movie/entity';
import { ShowEntity } from '@/resources/show/entity';

// {
//   '634492': {
//     title: 'Madame Web',
//     children: [],
//     requestId: '634492',
//     type: 'movie',
//     thumb: '/rULWuutDcN5NvtiZi4FRPzRYWSh.jpg',
//     imdb_id: 'tt11057302',
//     tmdb_id: '634492',
//     tvdb_id: 'n/a',
//     users: [ '660854db9eedb831193b6438' ],
//     sonarrId: [],
//     radarrId: [],
//     media: {
//       backdrop_path: '/zAepSrO99owYwQqi0QG2AS0dHXw.jpg',
//       budget: 80000000,
//       id: 634492,
//       imdb_id: 'tt11057302',
//       poster_path: '/rULWuutDcN5NvtiZi4FRPzRYWSh.jpg',
//       production_companies: [Array],
//       release_date: '2024-02-14',
//       title: 'Madame Web',
//       video: false,
//       videos: [Object],
//       keywords: [Array],
//       timestamp: 2024-03-31T19:50:37.038Z,
//       age_rating: '',
//       on_server: false,
//       available_resolutions: [],
//       imdb_data: false,
//       reviews: undefined,
//       collection: false
//     },
//     approved: false,
//     manualStatus: undefined,
//     process_stage: { status: 'pending', message: 'Pending', step: 2 },
//     defaults: undefined
//   }
// }
export const RequestsSchema = z.object({
  title: z.string(),
  children: z.array(z.unknown()),
  requestId: z.string(),
  type: z.string(),
  thumb: z.string(),
  imdb_id: z.string(),
  tmdb_id: z.string(),
  tvdb_id: z.string(),
  users: z.array(z.string()),
  sonarrId: z.array(z.unknown()),
  radarrId: z.array(z.unknown()),
  media: z.object({
    backdrop_path: z.string(),
    budget: z.number(),
    id: z.number(),
    imdb_id: z.string(),
    poster_path: z.string(),
    production_companies: z.array(z.unknown()),
    release_date: z.string(),
    title: z.string(),
    video: z.boolean(),
    videos: z.unknown(),
    keywords: z.array(z.unknown()),
    timestamp: z.date(),
    age_rating: z.string(),
    on_server: z.boolean(),
    available_resolutions: z.array(z.unknown()),
    imdb_data: z.boolean(),
    reviews: z.unknown().optional(),
    collection: z.boolean(),
  }),
  approved: z.boolean(),
  manualStatus: z.unknown().optional(),
  process_stage: z.object({
    status: z.string(),
    message: z.string(),
    step: z.number(),
  }),
  defaults: z.unknown().optional(),
});
export type Requests = z.infer<typeof RequestsSchema>;

export type RequestChildren = {
  id: number;
  info:
    | MovieEntity
    | (ShowEntity & {
        serverName: string;
      })
    | {
        message: string;
      };
  status: any[];
};

export type RequestState = {
  status: string;
  message: string;
  step: number;
};

export type RequestOutput = {
  [requestId: string]: {
    title: string;
    children: any[];
    requestId: string;
    type: string;
    thumb: string;
    imdb_id: string;
    tmdb_id: string;
    tvdb_id: string;
    users: string[];
    sonarrId: any[];
    radarrId: any[];
    media: any;
    approved: boolean;
    manualStatus: any;
    process_stage: RequestState;
    defaults: any;
    seasons?: any;
  };
};

export function isDownloaderMovie(data: any): data is MovieResource {
  return 'movieFile' in data;
}

export function isDownloaderSeries(data: any): data is SeriesResource {
  return 'seasons' in data;
}
